import { StateGraph } from "@langchain/langgraph";

import { agentState } from "./state.js";
import { router } from "./router.js";

import { chatAgent } from "../agents/chat.agent.js";
import { searchAgent } from "../agents/search.agent.js";
import { codingAgent } from "../agents/coding.agent.js";

const workflow = new StateGraph(agentState);

// Nodes
workflow.addNode("router", router);
workflow.addNode("chat", chatAgent);
workflow.addNode("search", searchAgent);
workflow.addNode("coding", codingAgent);

// Start
workflow.addEdge("__start__", "router");

// Route based on selected / detected agent
workflow.addConditionalEdges(
  "router",
  (state) => {
    switch (state.agent) {
      case "chat":
        return "chat";

      case "search":
        return "search";

      case "coding":
        return "coding";

      default:
        return "chat";
    }
  },
  {
    chat: "chat",
    search: "search",
    coding: "coding",
  }
);

// Search results go to Chat Agent
workflow.addEdge("search", "chat");

// End nodes
workflow.addEdge("chat", "__end__");
workflow.addEdge("coding", "__end__");

export const graph = workflow.compile();