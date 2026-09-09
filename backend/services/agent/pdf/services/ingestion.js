import crypto from "crypto";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { pdfConfig } from "../config/pdf.config.js";
import PdfDocument from "../models/document.model.js";
import PdfJob from "../models/job.model.js";
import { getPdf } from "../storage/object-storage.js";
import { embedDocuments } from "./embeddings.js";
import { upsertChunks } from "../vector/vector-store.js";

export const ingestDocument = async ({ documentId, userId, requestId }) => {
  const document = await PdfDocument.findOne({ _id: documentId, userId });
  if (!document) throw Object.assign(new Error("Document not found"), { statusCode: 404 });

  const job = await PdfJob.findOneAndUpdate(
    { requestId },
    { $setOnInsert: { userId, documentId, type: "ingest", requestId } },
    { upsert: true, new: true }
  );

  if (job.status === "completed" && document.status === "ready") return { document, job };

  await PdfJob.updateOne({ _id: job._id }, { status: "processing", error: null });
  await PdfDocument.updateOne({ _id: document._id }, { status: "processing", error: null });

  try {
    const buffer = await getPdf(document.objectKey);
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    if (!parsed.text?.trim()) throw new Error("The PDF contains no extractable text");

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: pdfConfig.chunkSize,
      chunkOverlap: pdfConfig.chunkOverlap,
    });
    const chunks = await splitter.createDocuments(
      parsed.pages.map((page) => page.text),
      parsed.pages.map((page) => ({ page: page.num }))
    );
    const vectors = await embedDocuments(chunks.map((chunk) => chunk.pageContent));

    await upsertChunks(
      chunks.map((chunk, index) => ({
        id: crypto.randomUUID(),
        vector: vectors[index],
        metadata: {
          userId,
          documentId: document._id.toString(),
          documentName: document.originalName,
          chunkIndex: index,
          page: chunks[index].metadata.page || 1,
          text: chunk.pageContent,
        },
      }))
    );

    await PdfDocument.updateOne(
      { _id: document._id },
      {
        status: "ready",
        pageCount: parsed.numpages || 0,
        chunkCount: chunks.length,
        error: null,
      }
    );
    await PdfJob.updateOne(
      { _id: job._id },
      { status: "completed", error: null }
    );

    return {
      document: await PdfDocument.findById(document._id),
      job: await PdfJob.findById(job._id),
    };
  } catch (error) {
    await PdfDocument.updateOne(
      { _id: document._id },
      { status: "failed", error: error.message }
    );
    await PdfJob.updateOne(
      { _id: job._id },
      { status: "failed", error: error.message }
    );
    throw error;
  }
};
