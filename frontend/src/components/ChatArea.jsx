import React, { useEffect } from "react";
import Nav from "./Nav";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useDispatch, useSelector } from "react-redux";
import getMessages from "../features/getMessages";
import { setArtifacts, setMessages } from "../redux/messageSlice";

function ChatArea() {
  const { selectedConversation } = useSelector(
    (state) => state.conversation
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const getMsg = async () => {
      // No conversation selected
      if (!selectedConversation) {
        dispatch(setMessages([]));
        dispatch(setArtifacts([]));
        return;
      }

      // New Chat does not have messages yet
      if (selectedConversation.title === "New Chat") {
        dispatch(setMessages([]));
        dispatch(setArtifacts([]));
        return;
      }

      try {
        const data = await getMessages(selectedConversation._id);

        console.log("Messages:", data);

        // Make sure data is an array
        const messages = Array.isArray(data) ? data : [];

        // Store messages
        dispatch(setMessages(messages));

        // Find latest message containing artifacts
        const latestArtifactMessage = [...messages]
          .reverse()
          .find(
            (msg) =>
              Array.isArray(msg?.artifacts) &&
              msg.artifacts.length > 0
          );

   
        dispatch(
          setArtifacts(
            latestArtifactMessage?.artifacts || []
          )
        );
      } catch (error) {
        console.error("Error fetching messages:", error);

        dispatch(setMessages([]));
        dispatch(setArtifacts([]));
      }
    };

    getMsg();
  }, [selectedConversation, dispatch]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  );
}

export default ChatArea;