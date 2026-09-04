import {
  Mic,
  Paperclip,
  Send,
  Zap,
  MessageSquare,
  Code2,
  Search,
} from "lucide-react";

import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import sendMessage from "../features/sendMessage";
import { createConversation } from "../features/createConversation";
import { updateConversation } from "../features/updateConversation";

import {
  addMessage,
  setArtifacts,
} from "../redux/messageSlice";

import {
  addConversation,
  setSelectedConversation,
  setConversationTitle,
} from "../redux/conversationSlice.js";

function ChatInput() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("auto");

  const loadingRef = useRef(false);

  const { selectedConversation } = useSelector(
    (state) => state.conversation
  );

  const dispatch = useDispatch();

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
    },
    {
      id: "coding",
      icon: Code2,
      label: "Coding",
    },
    {
      id: "search",
      icon: Search,
      label: "Search",
    },
  ];

  const handleSendMessage = async () => {
    const prompt = value.trim();

    if (!prompt || loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);

      let conversation = selectedConversation;
      let isNewConversation = false;

      // Create conversation if one doesn't exist
      if (!conversation) {
        const newConversation = await createConversation();

        if (!newConversation?._id) {
          throw new Error("Failed to create conversation");
        }

        dispatch(addConversation(newConversation));
        dispatch(setSelectedConversation(newConversation));

        conversation = newConversation;
        isNewConversation = true;
      }

      // Generate title for a new conversation
      if (isNewConversation) {
        const updatedConversation = await updateConversation(
          conversation._id,
          prompt
        );

        if (updatedConversation?.title) {
          dispatch(
            setConversationTitle({
              conversationId: conversation._id,
              title: updatedConversation.title,
            })
          );
        }
      }

      // Add user's message immediately
      dispatch(
        addMessage({
          role: "user",
          content: prompt,
          images: [],
        })
      );

      setValue("");

      // Send message to backend
      const data = await sendMessage({
        prompt,
        conversationId: conversation._id,
        agent: selectedAgent,
      });

      if (!data) {
        throw new Error("No response received from server");
      }

      // Store artifacts separately in Redux
      dispatch(setArtifacts(data.artifacts || []));

      // Add assistant response
      dispatch(
        addMessage({
          role: "assistant",
          content:
            data.answer ||
            "Sorry, I couldn't generate a response.",
          images: data.images || [],
          artifacts: data.artifacts || [],
        })
      );

      console.log(data);
    } catch (error) {
      console.error(
        "SEND MESSAGE ERROR:",
        error.response?.data || error.message
      );

      dispatch(
        addMessage({
          role: "assistant",
          content:
            error.response?.data?.message ||
            error.message ||
            "Sorry, something went wrong. Please try again.",
          images: [],
        })
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // Enter = send
  // Shift + Enter = new line
  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) {
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!value.trim() || loadingRef.current) {
        return;
      }

      handleSendMessage();
    }
  };

  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/[0.06] bg-[#0d0f14]">
      <div className="flex flex-col gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3">

        {/* Agent Selector */}
        <div className="flex w-full gap-2 pr-2 flex-wrap">
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.id;
            const Icon = agent.icon;

            return (
              <button
                key={agent.id}
                type="button"
                disabled={loading}
                onClick={() => setSelectedAgent(agent.id)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all
                  ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-indigo-500"
                      : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]"
                  }
                  ${
                    loading
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                <Icon
                  size={14}
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-500"
                  }
                />

                {agent.label}
              </button>
            );
          })}
        </div>

        {/* Message Input */}
        <textarea
          placeholder="Ask Anything..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={3}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
        />

        <div className="flex items-center justify-between">

          {/* Left Buttons */}
          <div className="flex items-center gap-1">

            <button
              type="button"
              disabled={loading}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Paperclip size={16} />
            </button>

            <button
              type="button"
              disabled={loading}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic size={16} />
            </button>

          </div>

          {/* Send Button */}
          <button
            type="button"
            disabled={!value.trim() || loading}
            onClick={handleSendMessage}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none transition-all duration-150
              ${
                value.trim() && !loading
                  ? "bg-gradient-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white cursor-pointer"
                  : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
              }
            `}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>

        </div>
      </div>
    </div>
  );
}

export default ChatInput;