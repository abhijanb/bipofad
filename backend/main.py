from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import engine
from src.auth.router import auth_router
from src.goals.router import goals_router
from src.vault.router import vault_router
from src.wallet.router import wallet_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield
    await engine.dispose()


app = FastAPI(title="Abhijan FastAPI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello from Abhijan FastAPI"}


app.include_router(auth_router, tags=["auth"])
app.include_router(goals_router, tags=["goals"])
app.include_router(vault_router, tags=["vault"])
app.include_router(wallet_router, tags=["wallet"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
