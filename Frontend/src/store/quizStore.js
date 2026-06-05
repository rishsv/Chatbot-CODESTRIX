import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useQuizStore = create(
  persist(
    (set) => ({
      quiz: null,
      currentIndex: 0,
      score: 0,
      selected: null,
      answered: false,

      userAnswers: [],

      history: [],

      setQuiz: (q) =>
        set({
          quiz: q,
          currentIndex: 0,
          score: 0,
          selected: null,
          answered: false,
          userAnswers: [],
        }),

      selectAnswer: (index) =>
        set({
          selected: index,
        }),

      setAnswered: (value) =>
        set({
          answered: value,
        }),

      saveAnswer: (answer) =>
        set((s) => ({
          userAnswers: [
            ...s.userAnswers,
            answer,
          ],
        })),

      answerQuestion: (correct) =>
        set((s) => ({
          score:
            s.score +
            (correct ? 1 : 0),
          answered: true,
        })),

      nextQuestion: () =>
        set((s) => ({
          currentIndex:
            s.currentIndex + 1,
          selected: null,
          answered: false,
        })),

      resetQuiz: () =>
        set({
          quiz: null,
          currentIndex: 0,
          score: 0,
          selected: null,
          answered: false,
          userAnswers: [],
        }),

      addHistory: (entry) =>
        set((s) => ({
          history: [
            entry,
            ...s.history,
          ].slice(0, 10),
        })),
    }),
    {
      name: "codestrix-quiz",

      partialize: (state) => ({
        history: state.history,
      }),
    }
  )
);