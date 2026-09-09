import { QdrantClient } from "@qdrant/js-client-rest";

import { isQdrantConfigured, pdfConfig } from "../config/pdf.config.js";

const qdrant = isQdrantConfigured
  ? new QdrantClient({
      url: pdfConfig.qdrantUrl,
      apiKey: pdfConfig.qdrantApiKey,
    })
  : null;

const memoryVectors = new Map();
let collectionReady;

const ensureCollection = async () => {
  if (!qdrant) return;
  if (!collectionReady) {
    collectionReady = qdrant
      .getCollection(pdfConfig.qdrantCollection)
      .catch(() =>
        qdrant.createCollection(pdfConfig.qdrantCollection, {
          vectors: { size: pdfConfig.qdrantVectorSize, distance: "Cosine" },
        })
      );
  }
  await collectionReady;
};

const cosineSimilarity = (left, right) => {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftMagnitude += left[index] ** 2;
    rightMagnitude += (right[index] || 0) ** 2;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude) || 1);
};

export const upsertChunks = async (chunks) => {
  if (qdrant) {
    await ensureCollection();
    await qdrant.upsert(pdfConfig.qdrantCollection, {
      wait: true,
      points: chunks.map((chunk) => ({
        id: chunk.id,
        vector: chunk.vector,
        payload: chunk.metadata,
      })),
    });
    return;
  }

  chunks.forEach((chunk) => memoryVectors.set(String(chunk.id), chunk));
};

export const searchChunks = async ({
  vector,
  userId,
  documentIds,
  limit = 6,
}) => {
  if (qdrant) {
    await ensureCollection();

    const filter = {
      must: [
        {
          key: "userId",
          match: {
            value: userId,
          },
        },
        ...(documentIds?.length
          ? [
              {
                key: "documentId",
                match: {
                  any: documentIds,
                },
              },
            ]
          : []),
      ],
    };

    const response = await qdrant.query(
      pdfConfig.qdrantCollection,
      {
        query: vector,
        limit,
        with_payload: true,
        filter,
      }
    );

    return response.points.map((result) => ({
      score: result.score,
      ...result.payload,
    }));
  }

  return [...memoryVectors.values()]
    .filter(
      (chunk) =>
        chunk.metadata.userId === userId &&
        (!documentIds?.length ||
          documentIds.includes(chunk.metadata.documentId))
    )
    .map((chunk) => ({
      score: cosineSimilarity(vector, chunk.vector),
      ...chunk.metadata,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
};