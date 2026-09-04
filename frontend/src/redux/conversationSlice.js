import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",

  initialState: {
    conversations: [],
    selectedConversation: null,
  },

  reducers: {
    addConversation: (state, action) => {
      state.conversations.push(action.payload);
    },

    setConversations: (state, action) => {
      state.conversations = action.payload;
    },

    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },

    setConversationTitle: (state, action) => {
      const { conversationId, title } = action.payload;

      const conversation = state.conversations.find(
        (item) => item._id === conversationId
      );

      if (conversation) {
        conversation.title = title;
      }

      if (
        state.selectedConversation &&
        state.selectedConversation._id === conversationId
      ) {
        state.selectedConversation.title = title;
      }
    },
  },
});

export const {
  setConversations,
  addConversation,
  setSelectedConversation,
  setConversationTitle,
} = conversationSlice.actions;

export default conversationSlice.reducer;