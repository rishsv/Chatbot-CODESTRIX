from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
from RagBot.app.skill.mentor_agent import mentor_agent

router = APIRouter(
    prefix="/api/chat",
    tags=["chat"],
)

@router.post("/stream")
async def chat_stream(
    payload: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    session = db.query(models.Session).filter(
        models.Session.id == payload.session_id,
        models.Session.user_id == current_user.id
    ).first()

    if not session:
        session = models.Session(
            id=payload.session_id,
            user_id=current_user.id,
            title="Guest Chat"
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    response = mentor_agent(
        payload.message,
        db,
        payload.session_id,
        current_user.id
    )

    # Quiz response
    if isinstance(response, dict) and "questions" in response:
        return {
            "type": "quiz",
            "quiz": response
        }

    # Normal chat response
    return {
        "type": "chat",
        "response": response,
        "sources": [
            "rag_context_chunk_1",
            "rag_context_chunk_2"
        ],
        "thinking": [
            "Retrieving relevant chunks",
            "Ranking semantic matches",
            "Generating final response"
        ]
    }