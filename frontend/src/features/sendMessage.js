import api from "../../utils/axios";

async function sendMessage(payload) {
  try {
    const { data } = await api.post("/api/agent/chat", payload);
    return data;
  } catch (error) {
    console.error("SEND MESSAGE API ERROR:", error);
    throw error;
  }
}

export default sendMessage;