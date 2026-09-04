import { z } from "zod";
import { getModel } from "../config/llmModels.js";

const codingSchema = z.object({
  files: z.array(
    z.object({
      name: z.string(),
      content: z.string(),
    })
  ),
});

export const codingAgent = async (state) => {
  const intentLlm = await getModel("intent");

  const intentRes = await intentLlm.invoke(`
You are an intent classifier.

Return ONLY one of these values:

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:
${state.prompt}
  `);

  const intent = String(intentRes.content).trim();

  if (intent === "CODE_GENERATION") {
    const codingLlm = await getModel("coding");

    const structuredLlm =
      codingLlm.withStructuredOutput(codingSchema);

    const prompt = `
You are CortexAI Coding Agent.

Generate the requested project.

Default stack:
- HTML
- CSS
- JavaScript

Use React / Next.js / Vue ONLY if explicitly requested.

Rules:

- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.

Return the project as structured data.

Every file must contain:
- name
- complete content

Do not explain anything.

User Request:
${state.prompt}
`;

    const data = await structuredLlm.invoke(prompt);

    return {
      ...state,
      intent,
      aiResponse: "Code Generated Successfully.",
      artifacts: [
        {
          id: Date.now(),
          type: "Project",
          title: state.prompt,
          files: data.files || [],
        },
      ],
    };
  }

  const codingLlm = await getModel("coding");

  const response = await codingLlm.invoke(`
You are CortexAI Coding Agent.

The user's request is:

${state.prompt}

Provide a helpful response in Markdown.

Do not generate project files unless the user explicitly asks for code generation.
`);

  return {
    ...state,
    intent,
    aiResponse: response.content,
    artifacts: [],
  };
};