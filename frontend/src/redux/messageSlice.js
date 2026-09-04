import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "messages",

  initialState: {
    messages: [],
    artifacts: [],
  },

  reducers: {
    setMessages: (state, action) => {
      state.messages = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    setArtifacts: (state, action) => {
      state.artifacts = Array.isArray(action.payload)
        ? action.payload
        : [];
    },
  },
});

export const {
  setMessages,
  addMessage,
  setArtifacts,
} = messageSlice.actions;

export default messageSlice.reducer;