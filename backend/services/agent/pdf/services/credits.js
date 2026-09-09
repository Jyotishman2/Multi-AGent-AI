import crypto from "crypto";

import {
  CreditAccount,
  DailyUsage,
  UsageLedger,
} from "../models/usage.model.js";
import { pdfConfig } from "../config/pdf.config.js";

const today = () => new Date().toISOString().slice(0, 10);

export const chargeUsage = async ({ userId, operation, requestId, credits }) => {
  const ledgerRequestId = requestId || crypto.randomUUID();
  const existing = await UsageLedger.findOne({ userId, requestId: ledgerRequestId });
  if (existing) return existing;

  const limit = pdfConfig.usageLimits[operation];
  const usage = await DailyUsage.findOneAndUpdate(
    { userId, operation, day: today(), count: { $lt: limit } },
    { $inc: { count: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (!usage || usage.count > limit) {
    throw Object.assign(new Error(`${operation} daily limit reached`), {
      statusCode: 429,
    });
  }

  let account = await CreditAccount.findOneAndUpdate(
    { userId, balance: { $gte: credits } },
    { $inc: { balance: -credits } },
    { new: true }
  );

  if (!account) {
    account = await CreditAccount.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, balance: pdfConfig.startingCredits } },
      { upsert: true, new: true }
    );
    if (account.balance < credits) {
      throw Object.assign(new Error("Insufficient PDF credits"), {
        statusCode: 402,
      });
    }
    account = await CreditAccount.findOneAndUpdate(
      { userId, balance: { $gte: credits } },
      { $inc: { balance: -credits } },
      { new: true }
    );
  }

  try {
    return await UsageLedger.create({
      userId,
      requestId: ledgerRequestId,
      operation,
      credits,
      balanceAfter: account.balance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return UsageLedger.findOne({ userId, requestId: ledgerRequestId });
    }
    throw error;
  }
};

export const getCreditBalance = async (userId) => {
  const account = await CreditAccount.findOne({ userId });
  return account?.balance ?? pdfConfig.startingCredits;
};
