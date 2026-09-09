import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "PdfDocument" },
    type: { type: String, enum: ["ingest", "generate"], required: true },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
      index: true,
    },
    objectKey: String,
    error: String,
    requestId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const PdfJob = mongoose.model("PdfJob", jobSchema);

export default PdfJob;
