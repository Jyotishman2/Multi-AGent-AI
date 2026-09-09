import express from "express";
import multer from "multer";

import {
  askPdf,
  deleteDocument,
  downloadGeneratedPdf,
  generatePdf,
  listDocuments,
  reingestDocument,
  uploadDocument,
} from "../controllers/pdf.controller.js";
import { pdfConfig } from "../config/pdf.config.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: pdfConfig.maxFileSizeBytes },
});

const uploadPdf = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "PDF file exceeds the upload limit" });
    }
    return res.status(400).json({ message: error.message || "Invalid PDF upload" });
  });
};

router.post("/documents", uploadPdf, uploadDocument);
router.get("/documents", listDocuments);
router.post("/documents/:documentId/ingest", reingestDocument);
router.delete("/documents/:documentId", deleteDocument);
router.post("/rag/ask", askPdf);
router.post("/generate", generatePdf);
router.get("/files/:jobId", downloadGeneratedPdf);

export default router;
