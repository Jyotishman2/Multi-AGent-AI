
import { getModel } from "../config/llmModels.js";

export const router = async (state) => {
  if (state.agent && state.agent !== "auto") {
    return {
      ...state,
      agent: state.agent,
    };
  }

  const llm = await getModel("router");

  const prompt = `You are an agent router.

Available agents:

- chat
- search
- coding

Rules:

chat:
General conversation,
explanations,
learning,
questions.

search:
Current events,
latest information,
news,
recent developments,
internet lookup.

coding:
Generate code,
debug code,
build projects,
architecture,
API design.

Return ONLY one word:

chat
search
coding

User Query:

${state.prompt}
`;

  const response = await llm.invoke(prompt);

  const selectedAgent = response.content.trim().toLowerCase();

  console.log("ROUTED TO:", selectedAgent);

  return {
    ...state,
    agent: selectedAgent,
  };
};