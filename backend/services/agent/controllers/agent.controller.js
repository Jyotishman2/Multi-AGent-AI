import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";

export const agent = async (req, res) => {
  try {
    const { prompt, conversationId, agent } = req.body;

    if (!prompt || !conversationId) {
      return res.status(400).json({
        message: "Prompt and conversationId are required",
      });
    }

    await addMessage(conversationId, "user", prompt);

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });

    const result = await graph.invoke({
      prompt,
      conversationId,
      agent: agent?.toLowerCase() || "auto",
    });

    const response = result.aiResponse || "";
    const images = result.images || [];
    const artifacts = result.artifacts || [];

    await addMessage(
      conversationId,
      "assistant",
      response
    );

    await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
      conversationId,
      role: "assistant",
      content: response,
      images,
      artifacts:result?.artifacts
    });

    return res.status(200).json({
      answer: response,
      images,
      artifacts,
    });

  } catch (error) {
    console.error(
      "AGENT ERROR:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message:
        error.response?.data?.message ||
        `Agent error: ${error.message}`,
    });
  }
};