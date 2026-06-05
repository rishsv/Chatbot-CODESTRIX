import React, { useMemo, useState } from "react";
import {
  generateQuiz,
  submitQuizResults,
} from "../../services/quizService";
import { useQuizStore } from "../../store/quizStore";
import { useChatStore } from "../../store/chatStore";
import { useNavigate } from "react-router-dom";

const QuizBlock = () => {
  const quiz = useQuizStore((s) => s.quiz)
  const currentIndex = useQuizStore((s) => s.currentIndex)
  const score = useQuizStore((s) => s.score)
  const selected = useQuizStore((s) => s.selected)
  const answered = useQuizStore((s) => s.answered)

  const setQuiz = useQuizStore((s) => s.setQuiz)
  const selectAnswer = useQuizStore((s) => s.selectAnswer)
  const answerQuestion = useQuizStore((s) => s.answerQuestion)
  const nextQuestion = useQuizStore((s) => s.nextQuestion)
  const setAnswered = useQuizStore((s) => s.setAnswered)
  const resetQuiz = useQuizStore((s) => s.resetQuiz)
  const addHistory = useQuizStore((s) => s.addHistory)
  const saveAnswer = useQuizStore((s) => s.saveAnswer);
  const userAnswers = useQuizStore((s) => s.userAnswers);
  const addMessage = useChatStore((s) => s.addMessage);
  const navigate = useNavigate();

  const [topic, setTopic] = useState('Artificial Intelligence')
  const [loading, setLoading] = useState(false)
  const currentQuestion = useMemo(
    () => quiz?.questions?.[currentIndex],
    [quiz, currentIndex]
  )
  console.log(currentQuestion)

  const startQuiz = async () => {
    if (!topic.trim() || loading) return

    setLoading(true)

    try {
      const nextQuiz = await generateQuiz(topic, [])

      if (
        !nextQuiz ||
        !nextQuiz.questions ||
        !Array.isArray(nextQuiz.questions)
      ) {
        throw new Error('Invalid quiz response')
      }

      setQuiz(nextQuiz)
    } catch (error) {
      console.error('Quiz generation failed:', error)
    } finally {
      setLoading(false)
    }
  }


const handleNextQuestion = async () => {

  const isLastQuestion =
    currentIndex ===
    quiz.questions.length - 1;

  if (!isLastQuestion) {
    nextQuestion();
    return;
  }

  try {

    addMessage({
      role: "assistant",
      text:
        "Evaluating your quiz performance...",
      sources: [],
      thinking: [],
    });

    const result =
      await submitQuizResults(
  quiz.topic,
  quiz.difficulty,
  userAnswers,
  quiz.questions
);

    addMessage({
      role: "assistant",
      text: `
Quiz Evaluation

Score: ${result.score}/${result.total}

Accuracy: ${result.percentage.toFixed(1)}%

${result.feedback}
`,
      sources: [],
      thinking: [],
    });
    addHistory({
  id: quiz.quizId,
  topic: quiz.topic,
  score: result.score,
  total: result.total,
  createdAt: new Date().toISOString(),
});
    resetQuiz();

    navigate("/chat");

  } catch (err) {

    console.error(
      "Quiz evaluation failed",
      err
    );
  }
};

const submitAnswer = () => {
  if (!currentQuestion || selected === null)
    return;

  const answerMap = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
  };

  const correctIndex =
    answerMap[currentQuestion.answer];

  const correct =
    selected === correctIndex;

  const indexToLetter = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
  };

  saveAnswer(
    indexToLetter[selected]
  );

  answerQuestion(correct);
};

  const finishQuiz = () => {
    if (!quiz) return

    addHistory({
      id: quiz.quizId,
      topic: quiz.topic,
      score,
      total: quiz.questions.length,
      createdAt: new Date().toISOString(),
    })

    resetQuiz()
  }

  if (!quiz) {
    return (
      <div className="quiz-block empty">
        <span className="eyebrow">Quiz</span>

        <h2>
          Generate a quiz from your current topic
        </h2>

        <p>
          Test understanding using active recall
          powered by your uploaded documents.
        </p>

        <div className="quiz-controls">
          <input
            value={topic}
            onChange={(e) =>
              setTopic(e.target.value)
            }
            placeholder="Enter a topic"
          />

          <button
            onClick={startQuiz}
            disabled={loading}
          >
            {loading
              ? 'Generating…'
              : 'Generate Quiz'}
          </button>
        </div>
      </div>
    )
  }


  if (!currentQuestion) {
    return (
      <div className="quiz-block">
        Failed to load question.
      </div>
    )
  }

  return (
    <div className="quiz-block">
      <div className="quiz-head">
        <div>
          <span className="eyebrow">
            Quiz Mode
          </span>

          <h2>{quiz.topic}</h2>
        </div>

        <div className="status-pill active">
          {currentIndex + 1}/
          {quiz.questions.length}
        </div>
      </div>

      <div className="quiz-question">
        {currentQuestion.question}
      </div>

      <div className="quiz-options">
        {currentQuestion.options?.map(
          (option, index) => {
            const isSelected =
              selected === index

            const answerMap = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
};

const correctIndex =
  answerMap[currentQuestion.answer];

const isCorrect =
  answered &&
  index === correctIndex;

const isWrong =
  answered &&
  isSelected &&
  index !== correctIndex;

            return (
              <button
                key={option}
                className={`quiz-option ${
                  isSelected ? 'selected' : ''
                } ${
                  isCorrect ? 'correct' : ''
                } ${isWrong ? 'wrong' : ''}`}
                onClick={() =>
                  selectAnswer(index)
                }
                disabled={answered}
              >
                {option}
              </button>
            )
          }
        )}
      </div>

      <div className="quiz-actions">
        {!answered ? (
          <button
            onClick={submitAnswer}
            disabled={selected === null}
          >
            Submit
          </button>
        ) : (
          <button onClick={handleNextQuestion}>
  {currentIndex ===
  quiz.questions.length - 1
    ? "Finish Quiz"
    : "Next Question"}
</button>
        )}

        <button
          className="ghost"
          onClick={() => {
            selectAnswer(null)
            setAnswered(false)
          }}
        >
          Reset Choice
        </button>
      </div>
    </div>
  )
}

export default QuizBlock