import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import { getModel } from "../config/llmModels.js";
import { getMemory } from "../config/memory.js";

// Limit history so conversations don't grow indefinitely
const MAX_HISTORY_MESSAGES = 20;

// Limit the amount of search content sent to the LLM
const MAX_SEARCH_RESULTS = 5;

export const chatAgent = async (state) => {
  try {
    const llm = await getModel("chat");

    const history = await getMemory(state.conversationId);

    // -----------------------------
    // FORMAT SEARCH RESULTS
    // -----------------------------

    let searchContext = "";

    if (state.searchResults) {
      let results = state.searchResults;

      if (!Array.isArray(results) && results.results) {
        results = results.results;
      }

      if (Array.isArray(results) && results.length > 0) {
        const formattedResults = results
          .slice(0, MAX_SEARCH_RESULTS)
          .map((result, index) => {
            const title = result?.title || "Untitled";
            const url = result?.url || "";
            const content =
              result?.content ||
              result?.snippet ||
              result?.raw_content ||
              "";

            return `
SOURCE ${index + 1}
Title: ${title}
URL: ${url}
Content:
${String(content).slice(0, 2000)}
            `.trim();
          })
          .join("\n\n---\n\n");

        searchContext = `
You have access to the following web search results.

${formattedResults}

Use these sources only when they are relevant to the user's request.

SOURCE RULES:
- Do not mention "search results" unless useful.
- Do not dump raw source data.
- Do not invent URLs.
- If the user asks for a link, provide the most relevant URL directly.
- If multiple links are useful, provide a short bullet list.
- Do not create a table unless the user explicitly requests one or a comparison genuinely requires it.
`;
      }
    }

    // -----------------------------
    // SYSTEM PROMPT
    // -----------------------------

    const systemPrompt = `
You are CortexAI, a highly capable, intelligent, accurate, and helpful AI assistant.

Your goal is to understand the user's real intent and provide the best possible answer.

${searchContext}

GENERAL BEHAVIOR:

- Answer the user's actual question directly.
- Be concise when the question is simple.
- Be detailed when the question requires depth.
- Do not over-explain simple concepts.
- Do not create unnecessary introductions or conclusions.
- Do not ask unnecessary follow-up questions.
- If the user's request is ambiguous but can reasonably be answered, make a sensible assumption and state it briefly if needed.
- If you do not know something, say so instead of inventing an answer.
- Never claim to have performed an action you did not perform.

CONVERSATION STYLE:

- Sound natural, confident, helpful, and intelligent.
- Match the user's tone and level of expertise.
- For casual conversation, respond naturally without unnecessary formatting.
- For technical questions, explain clearly and accurately.
- For coding questions, provide practical, working examples.
- For educational questions, explain concepts step by step when useful.

SEARCH AND WEB RESULTS:

- Use provided web information when relevant.
- Prefer direct answers over listing every source.
- Do not expose raw JSON.
- Do not invent facts, URLs, or source content.
- If the user asks for a website link, provide the link directly.
- If the user asks for the best option, explain why it is the best option.
- If current information is unavailable in the provided context, be transparent.

FORMATTING:

- Use plain text for very short or casual answers.
- Use Markdown only when it improves readability.
- Use headings only for longer, structured answers.
- Do not force headings for every response.
- Use bullet points for lists.
- Use numbered lists for steps or sequences.
- Use tables ONLY when:
  1. the user explicitly asks for a table, OR
  2. comparing multiple items across multiple attributes genuinely benefits from a table.
- Never use a table just to display a link.
- Keep paragraphs reasonably short.
- Use bold for important terms sparingly.
- Use inline code for filenames, variables, commands, and short code.
- Use fenced code blocks with language identifiers for multi-line code.

CODE RULES:

- Prefer complete, runnable code when appropriate.
- Do not omit important imports or setup unless the user asks for a snippet.
- Explain important changes after the code when useful.
- Keep existing project conventions unless there is a clear reason to change them.
- Do not rewrite unrelated parts of the user's code.
- Preserve the user's architecture and naming where possible.
- When fixing code, identify the actual bug before suggesting unrelated changes.

LINK RULES:

- If the user asks for a specific link, give the direct link first.
- Do not put a single link inside a Markdown table.
- Prefer this format:

  [OpenAI](https://openai.com)

- If the user wants multiple links, use a clean bullet list.

IMAGE RULES:

- If images are available in the context, they may be relevant to the response.
- Do not mention images unless useful.
- Do not fabricate image URLs.

MEMORY RULES:

- Use the conversation history to maintain context.
- Do not repeat information the user has already established unless necessary.
- Respect corrections from the user.
- The most recent user instruction takes priority over older conversation context.

QUALITY CHECK:

Before answering, internally ensure that:
1. You answered the actual question.
2. You used the available context correctly.
3. You did not invent information.
4. Your formatting matches the user's request.
5. You did not use a table unnecessarily.
6. The answer is as concise or detailed as the task requires.
`;

    // -----------------------------
    // BUILD MESSAGE HISTORY
    // -----------------------------

    const messages = [
      new SystemMessage({
        content: systemPrompt,
      }),
    ];

    const validHistory = Array.isArray(history)
      ? history
          .filter((msg) => {
            return (
              msg &&
              typeof msg === "object" &&
              ["user", "assistant", "ai"].includes(msg.role) &&
              msg.content !== undefined &&
              msg.content !== null
            );
          })
          .slice(-MAX_HISTORY_MESSAGES)
      : [];

    for (const msg of validHistory) {
      const content =
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content);

      if (!content.trim()) {
        continue;
      }

      if (msg.role === "user") {
        messages.push(
          new HumanMessage({
            content,
          })
        );
      } else if (
        msg.role === "assistant" ||
        msg.role === "ai"
      ) {
        messages.push(
          new AIMessage({
            content,
          })
        );
      }
    }

    const lastHistoryMessage =
      validHistory[validHistory.length - 1];

    const currentPromptAlreadyIncluded =
      lastHistoryMessage?.role === "user" &&
      String(lastHistoryMessage?.content).trim() ===
        String(state.prompt).trim();

    if (
      state.prompt &&
      !currentPromptAlreadyIncluded
    ) {
      messages.push(
        new HumanMessage({
          content: String(state.prompt),
        })
      );
    }

    // -----------------------------
    // INVOKE MODEL
    // -----------------------------

    const response = await llm.invoke(messages);

    let aiResponse = response?.content;

    if (typeof aiResponse === "string") {
      aiResponse = aiResponse.trim();
    }

    if (
      typeof aiResponse !== "string" &&
      aiResponse !== undefined &&
      aiResponse !== null
    ) {
      aiResponse = JSON.stringify(aiResponse);
    }

    if (!aiResponse) {
      aiResponse =
        "I’m sorry, but I couldn’t generate a response.";
    }

    return {
      aiResponse,
    };
  } catch (error) {
    return {
      aiResponse:
        "I’m sorry, something went wrong while generating the response. Please try again.",
    };
  }
};