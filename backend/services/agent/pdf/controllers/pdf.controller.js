import crypto from "crypto";
import { Readable } from "stream";

import PdfDocument from "../models/document.model.js";
import PdfJob from "../models/job.model.js";
import { pdfConfig } from "../config/pdf.config.js";
import {
  deletePdf,
  getPdf,
  getPdfUrl,
  makeObjectKey,
  putPdf,
} from "../storage/object-storage.js";
import { ingestDocument } from "../services/ingestion.js";
import { chargeUsage, getCreditBalance } from "../services/credits.js";
import { pdfRagAgent } from "../agents/pdf-rag.agent.js";
import { createTemplate, renderPdf } from "../services/pdf-generator.js";

const userIdFrom = (req) => req.headers["x-user-id"];
const requestIdFrom = (req) => req.get("x-request-id") || crypto.randomUUID();

const requireUser = (req) => {
  const userId = userIdFrom(req);
  if (!userId) throw Object.assign(new Error("Authenticated user is required"), { statusCode: 401 });
  return userId;
};

const sendError = (res, error) => {
  const status = error.statusCode || (error.name === "ZodError" ? 400 : 500);
  return res.status(status).json({ message: error.message || "PDF request failed" });
};

export const uploadDocument = async (req, res) => {
  try {
    const userId = requireUser(req);
    if (!req.file) return res.status(400).json({ message: "A PDF file is required" });
    if (req.file.mimetype !== "application/pdf") {
      return res.status(415).json({ message: "Only PDF files are supported" });
    }
    if (req.file.size > pdfConfig.maxFileSizeBytes) {
      return res.status(413).json({ message: "PDF file exceeds the upload limit" });
    }

    const requestId = requestIdFrom(req);
    await chargeUsage({
      userId,
      operation: "ingest",
      requestId,
      credits: pdfConfig.creditCosts.ingest,
    });

    const objectKey = makeObjectKey(userId, req.file.originalname);
    const checksum = crypto.createHash("sha256").update(req.file.buffer).digest("hex");
    await putPdf(objectKey, req.file.buffer);

    const document = await PdfDocument.create({
      userId,
      originalName: req.file.originalname,
      objectKey,
      mimeType: req.file.mimetype,
      size: req.file.size,
      checksum,
      status: "uploaded",
    });

    const result = await ingestDocument({
      documentId: document._id,
      userId,
      requestId: `${requestId}:ingest`,
    });

    return res.status(201).json({
      document: result.document,
      job: result.job,
      credits: await getCreditBalance(userId),
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    return sendError(res, error);
  }
};

export const listDocuments = async (req, res) => {
  try {
    const userId = requireUser(req);
    const documents = await PdfDocument.find({ userId, status: { $ne: "deleted" } })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ documents, credits: await getCreditBalance(userId) });
  } catch (error) {
    return sendError(res, error);
  }
};

export const reingestDocument = async (req, res) => {
  try {
    const userId = requireUser(req);
    const requestId = requestIdFrom(req);
    await chargeUsage({
      userId,
      operation: "ingest",
      requestId,
      credits: pdfConfig.creditCosts.ingest,
    });
    const result = await ingestDocument({
      documentId: req.params.documentId,
      userId,
      requestId: `${requestId}:ingest`,
    });
    return res.json({ document: result.document, job: result.job });
  } catch (error) {
    return sendError(res, error);
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const userId = requireUser(req);
    const document = await PdfDocument.findOne({ _id: req.params.documentId, userId });
    if (!document) return res.status(404).json({ message: "Document not found" });
    await deletePdf(document.objectKey);
    await PdfDocument.updateOne({ _id: document._id }, { status: "deleted" });
    return res.status(204).send();
  } catch (error) {
    return sendError(res, error);
  }
};

export const askPdf = async (req, res) => {
  try {
    const userId = requireUser(req);
    const { prompt, documentIds } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ message: "Prompt is required" });
    if (documentIds?.length) {
      const count = await PdfDocument.countDocuments({
        _id: { $in: documentIds },
        userId,
        status: "ready",
      });
      if (count !== documentIds.length) {
        return res.status(404).json({ message: "One or more PDF documents are unavailable" });
      }
    }

    const requestId = requestIdFrom(req);
    await chargeUsage({
      userId,
      operation: "rag",
      requestId,
      credits: pdfConfig.creditCosts.rag,
    });
    const result = await pdfRagAgent({ prompt, userId, documentIds });
    return res.json({ ...result, credits: await getCreditBalance(userId) });
  } catch (error) {
    console.error("PDF RAG error:", error);
    return sendError(res, error);
  }
};

export const generatePdf = async (req, res) => {
  try {
    const userId = requireUser(req);
    const { prompt, template } = req.body;
    if (!prompt?.trim() && !template) {
      return res.status(400).json({ message: "Prompt or template is required" });
    }

    const requestId = requestIdFrom(req);
    await chargeUsage({
      userId,
      operation: "generate",
      requestId,
      credits: pdfConfig.creditCosts.generate,
    });
    const documentTemplate = await createTemplate({ prompt, template });
    const buffer = await renderPdf(documentTemplate);
    const objectKey = makeObjectKey(userId, `${documentTemplate.title}.pdf`);
    await putPdf(objectKey, buffer);
    const job = await PdfJob.create({
      userId,
      type: "generate",
      status: "completed",
      objectKey,
      requestId,
    });

    return res.status(201).json({
      jobId: job._id,
      template: documentTemplate,
      downloadUrl: await getPdfUrl(objectKey),
      downloadPath: `/pdf/files/${job._id}`,
      credits: await getCreditBalance(userId),
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return sendError(res, error);
  }
};

export const downloadGeneratedPdf = async (req, res) => {
  try {
    const userId = requireUser(req);
    const job = await PdfJob.findOne({ _id: req.params.jobId, userId, type: "generate", status: "completed" });
    if (!job) return res.status(404).json({ message: "Generated PDF not found" });
    const buffer = await getPdf(job.objectKey);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="cortex-generated-${job._id}.pdf"`);
    return Readable.from(buffer).pipe(res);
  } catch (error) {
    return sendError(res, error);
  }
};
