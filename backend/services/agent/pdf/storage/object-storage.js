import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

import { createClient } from "@supabase/supabase-js";

import {
  isSupabaseStorageConfigured,
  pdfConfig,
} from "../config/pdf.config.js";

const supabase = isSupabaseStorageConfigured
  ? createClient(pdfConfig.supabaseUrl, pdfConfig.supabaseSecretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

const localPath = (key) => path.resolve(pdfConfig.localStoragePath, key);

export const putPdf = async (key, buffer) => {
  if (supabase) {
    const { error } = await supabase.storage
      .from(pdfConfig.storageBucket)
      .upload(key, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (error) throw error;
    return key;
  }

  const target = localPath(key);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer);
  return key;
};

export const getPdf = async (key) => {
  if (supabase) {
    const { data, error } = await supabase.storage
      .from(pdfConfig.storageBucket)
      .download(key);
    if (error) throw error;
    return Buffer.from(await data.arrayBuffer());
  }

  return fs.readFile(localPath(key));
};

export const deletePdf = async (key) => {
  if (supabase) {
    const { error } = await supabase.storage
      .from(pdfConfig.storageBucket)
      .remove([key]);
    if (error) throw error;
    return;
  }

  await fs.rm(localPath(key), { force: true });
};

export const getPdfUrl = async (key, expiresIn = 900) => {
  if (supabase) {
    const { data, error } = await supabase.storage
      .from(pdfConfig.storageBucket)
      .createSignedUrl(key, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  }

  return null;
};

export const makeObjectKey = (userId, filename) => {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${userId}/${crypto.randomUUID()}-${safeName}`;
};
