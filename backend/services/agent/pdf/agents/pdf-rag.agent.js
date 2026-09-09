import { getModel } from "../../config/llmModels.js";
import { embedQuery } from "../services/embeddings.js";
import { searchChunks } from "../vector/vector-store.js";

const formatSources = (sources) =>
  sources
    .map(
      (source, index) =>
        `[${index + 1}] ${source.documentName}, page ${source.page}\n${source.text}`
    )
    .join("\n\n");

export const pdfRagAgent = async ({ prompt, userId, documentIds }) => {
  const queryVector = await embedQuery(prompt);
  const sources = await searchChunks({
    vector: queryVector,
    userId,
    documentIds,
    limit: 6,
  });

  if (!sources.length) {
    return {
      answer: "I could not find any indexed PDF content matching your request.",
      citations: [],
    };
  }

  const model = await getModel("chat");
  const response = await model.invoke(`
You are CortexAI PDF RAG Assistant. Answer only from the supplied PDF excerpts.
If the excerpts do not support an answer, say so clearly.
Cite supporting excerpts inline using [1], [2], etc.

PDF EXCERPTS:
${formatSources(sources)}

QUESTION:
${prompt}
`);

  return {
    answer: response.content,
    citations: sources.map((source, index) => ({
      index: index + 1,
      documentId: source.documentId,
      documentName: source.documentName,
      page: source.page,
      score: source.score,
      excerpt: source.text.slice(0, 500),
    })),
  };
};
