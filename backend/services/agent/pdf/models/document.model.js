import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    originalName: { type: String, required: true, trim: true },
    objectKey: { type: String, required: true, unique: true },
    mimeType: { type: String, required: true, enum: ["application/pdf"] },
    size: { type: Number, required: true, min: 1 },
    checksum: { type: String, required: true },
    pageCount: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["uploaded", "processing", "ready", "failed", "deleted"],
      default: "uploaded",
      index: true,
    },
    error: String,
    parserVersion: { type: String, default: "pdf-parse-1" },
  },
  { timestamps: true }
);

documentSchema.index({ userId: 1, createdAt: -1 });

const PdfDocument = mongoose.model("PdfDocument", documentSchema);

export default PdfDocument;
