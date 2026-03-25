from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.auth import router as auth_router
from .api.users import router as user_router
from .api.block_text import router as text_router
from .api.comment import router as comment_router

app = FastAPI(
    title="Text Sender API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://153.80.251.221",
        "http://153.80.251.221:5173",
        "http://localhost",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(user_router, prefix="/users", tags=["users"])
app.include_router(text_router, prefix="/blocks", tags=["blocks"])
app.include_router(comment_router, prefix="/comment", tags=["comment"])


@app.get("/", tags=["root"])
async def root():
    return {"message": "Text Sender API is running"}