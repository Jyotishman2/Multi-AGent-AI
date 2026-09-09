import dotenv from "dotenv";

dotenv.config();

export const pdfConfig = {
  // PDF upload limits
  maxFileSizeBytes: Number(
    process.env.PDF_MAX_FILE_SIZE_BYTES || 15 * 1024 * 1024
  ),

  // Text chunking
  chunkSize: Number(process.env.PDF_CHUNK_SIZE || 1000),

  chunkOverlap: Number(process.env.PDF_CHUNK_OVERLAP || 150),

  // Embeddings
  embeddingModel:
    process.env.PDF_EMBEDDING_MODEL || "gemini-embedding-001",

  // Qdrant
  qdrantUrl: process.env.QDRANT_URL,

  qdrantApiKey: process.env.QDRANT_API_KEY,

  qdrantCollection:
    process.env.QDRANT_COLLECTION || "cortex_pdf_chunks",

  qdrantVectorSize: Number(
    process.env.QDRANT_VECTOR_SIZE || 768
  ),

  // Supabase storage
  supabaseUrl: process.env.SUPABASE_URL,

  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,

  storageBucket:
    process.env.SUPABASE_STORAGE_BUCKET || "pdfs",

  // Local storage fallback
  localStoragePath:
    process.env.PDF_LOCAL_STORAGE_PATH || ".data/pdfs",

  // PDF credits
  startingCredits: Number(
    process.env.PDF_STARTING_CREDITS || 100
  ),

  creditCosts: {
    ingest: Number(
      process.env.PDF_INGEST_CREDITS || 5
    ),

    rag: Number(
      process.env.PDF_RAG_CREDITS || 1
    ),

    generate: Number(
      process.env.PDF_GENERATE_CREDITS || 5
    ),
  },

  // Daily usage limits
  usageLimits: {
    ingest: Number(
      process.env.PDF_DAILY_INGEST_LIMIT || 20
    ),

    rag: Number(
      process.env.PDF_DAILY_RAG_LIMIT || 100
    ),

    generate: Number(
      process.env.PDF_DAILY_GENERATE_LIMIT || 20
    ),
  },
};

export const isSupabaseStorageConfigured = Boolean(
  pdfConfig.supabaseUrl &&
    pdfConfig.supabaseSecretKey
);

export const isQdrantConfigured = Boolean(
  pdfConfig.qdrantUrl &&
    pdfConfig.qdrantApiKey
);