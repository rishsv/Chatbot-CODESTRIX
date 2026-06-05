import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { sendMessage } from "../services/chatService";
import { useChatStore } from "../store/chatStore";
import { useQuizStore } from "../store/quizStore";

export const useChat = () => {
  const addMessage = useChatStore(
    (s) => s.addMessage
  );
  const setLoading = useChatStore(
    (s) => s.setLoading
  );
  const sessionId = useChatStore(
    (s) => s.sessionId
  );
  const setQuiz = useQuizStore(
    (s) => s.setQuiz
  );
  const navigate = useNavigate();
  const send = useCallback(
    async (text) => {

      if (!text.trim()) return;

      setLoading(true);

      addMessage({
        role: "user",
        text,
      });

      try {

        const data =
          await sendMessage(
            text,
            sessionId
          );

        console.log(
          "CHAT RESPONSE:",
          data
        );

        if (
          data.type === "quiz"
        ) {

          setQuiz(data.quiz);

          navigate("/quiz");

          return;
        }

        addMessage({
          role: "assistant",
          text:
            data.response || "",
          sources:
            data.sources || [],
          thinking:
            data.thinking || [],
          mode: "backend",
        });

      } catch (error) {

        console.error(
          "Chat request failed:",
          error
        );

        addMessage({
          role: "assistant",
          text:
            "Failed to connect to backend.",
          mode: "error",
        });

      } finally {

        setLoading(false);

      }
    },

    [
      addMessage,
      setLoading,
      sessionId,
      setQuiz,
      navigate,
    ]
  );

  return { send };
};