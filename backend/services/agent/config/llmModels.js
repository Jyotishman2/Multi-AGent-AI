import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenRouter } from "@langchain/openrouter";

dotenv.config();

const groq = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: process.env.GROQ_API_KEY,
});

const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    apiKey: process.env.GEMINI_API_KEY,
});

const openrouter = new ChatOpenRouter({
    model: "deepseek/deepseek-chat",
    temperature: 0,
    maxTokens: 2500,
    apiKey: process.env.OPENROUTER_API_KEY,
});

export const getModel = (agent) => {
    switch (agent) {
        case "chat":
            return groq;

        case "search":
            return groq;

        case "coding":
            return gemini;

        case "openrouter":
            return openrouter;

        default:
            return groq;
    }
};