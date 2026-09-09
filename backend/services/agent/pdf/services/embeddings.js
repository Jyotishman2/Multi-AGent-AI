import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

import { pdfConfig } from "../config/pdf.config.js";

const embeddings = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: pdfConfig.embeddingModel,
    })
  : null;

const fallbackEmbedding = (text, size = pdfConfig.qdrantVectorSize) => {
  const vector = Array.from({ length: size }, () => 0);
  for (let index = 0; index < text.length; index += 1) {
    vector[index % size] += (text.charCodeAt(index) % 31) / 31;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value ** 2, 0)) || 1;
  return vector.map((value) => value / magnitude);
};

export const embedDocuments = async (texts) => {
  if (embeddings) return embeddings.embedDocuments(texts);
  return texts.map(fallbackEmbedding);
};

export const embedQuery = async (text) => {
  if (embeddings) return embeddings.embedQuery(text);
  return fallbackEmbedding(text);
};
