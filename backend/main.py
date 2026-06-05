from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from the repository root .env early so routers
# and RagBot modules that read env on import see the keys.
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
PROJECT_ENV = os.path.join(ROOT_DIR, ".env")
load_dotenv(PROJECT_ENV)

from backend.app.database import engine, Base
from backend.app.routers import auth, sessions, chat, quiz, clustering, documents

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Personalized Learning Recommender Chatbot API",
    description="FastAPI Backend powered by Groq & local ChromaDB RAG",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(chat.router)
app.include_router(quiz.router)
app.include_router(clustering.router)
app.include_router(documents.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "learning-recommender-api"
    }

# Run Server
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )