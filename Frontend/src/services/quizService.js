import { api } from "./api";

export const generateQuiz = async (
  topic,
  docIds = []
) => {
  try {
    const res = await api.post(
      "/quiz/generate",
      {
        topic,
        docIds,
      }
    );

    return res.data;
  } catch (error) {
    console.error("Quiz generation failed:", error);

    return {
      quizId: null,
      topic,
      questions: [],
    };
  }
};

export const submitQuizResults = async (
  topic,
  difficulty,
  answers,
  questions
) => {
  const res = await api.post("/quiz/submit", {
    topic,
    difficulty,
    answers,
    questions,
  });

  return res.data;
};