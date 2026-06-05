import { api } from "./api";

export const sendMessage = async (
  message,
  sessionId
) => {
  try {

    const res = await api.post(
      "/chat/stream",
      {
        message,
        session_id: sessionId,
      }
    );

    console.log(
      "CHAT API RESPONSE:",
      res.data
    );

    return res.data;

  } catch (error) {

    console.error(
      "Chat API Error:",
      error
    );

    return {
      type: "error",
      response:
        "Backend connection failed.",
      sources: [],
      thinking: [],
    };
  }
};

export const streamMessage = async (
  message,
  sessionId,
  onChunk
) => {

  const result = await sendMessage(
    message,
    sessionId
  );

  if (
    result.type === "chat" &&
    onChunk
  ) {
    onChunk(result.response);
  }

  return result;
};