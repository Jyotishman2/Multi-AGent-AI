import mongoose from "mongoose";

const creditAccountSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const usageLedgerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    requestId: { type: String, required: true },
    operation: { type: String, required: true },
    credits: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

usageLedgerSchema.index({ userId: 1, requestId: 1 }, { unique: true });

const dailyUsageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    operation: { type: String, required: true },
    day: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

dailyUsageSchema.index(
  { userId: 1, operation: 1, day: 1 },
  { unique: true }
);

export const CreditAccount = mongoose.model("PdfCreditAccount", creditAccountSchema);
export const UsageLedger = mongoose.model("PdfUsageLedger", usageLedgerSchema);
export const DailyUsage = mongoose.model("PdfDailyUsage", dailyUsageSchema);
