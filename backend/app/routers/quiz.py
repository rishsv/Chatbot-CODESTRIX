from uuid import uuid4
from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from .auth import get_current_user

from RagBot.app.quiz.quiz_generator import generate_quiz
from RagBot.app.quiz.quiz_engine import submit_quiz

router = APIRouter(
    prefix="/api/quiz",
    tags=["Quiz"]
)


class QuizGenerateRequest(BaseModel):

    topic: str

    difficulty: Literal[
        "beginner",
        "intermediate",
        "advanced"
    ] = "beginner"

    previous_questions: list = Field(
        default_factory=list
    )


@router.post("/generate")
def generate_quiz_route(
    payload: QuizGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    raw_questions = generate_quiz(
        topic=payload.topic,
        difficulty=payload.difficulty,
        previous_questions=payload.previous_questions
    )

    formatted_questions = []

    for index, question_data in enumerate(raw_questions):

        options = question_data.get("options", [])

        answer = question_data.get("answer")

        answer_map = {
                    "A": 0,
                    "B": 1,
                    "C": 2,
                    "D": 3
                }

        correct_index = answer_map.get(answer, 0)

        formatted_questions.append({

            "id": index + 1,

            "question": question_data.get(
                "question",
                ""
            ),

            "options": options,

            "correctAnswer": correct_index,

            "answer": answer,

            "explanation": question_data.get(
                "explanation",
                ""
            )
        })

    return {

        "quizId": str(uuid4()),

        "topic": payload.topic,

        "difficulty": payload.difficulty,

        "questions": formatted_questions
    }

class QuizSubmitRequest(BaseModel):
    topic: str
    difficulty: str
    answers: list[str]
    questions: list

@router.post("/submit")
def submit_quiz_route(
    payload: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    return submit_quiz(
    topic=payload.topic,
    difficulty=payload.difficulty,
    answers=payload.answers,
    questions=payload.questions,
    db=db,
    user_id=current_user.id
)