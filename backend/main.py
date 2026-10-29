from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db

app = FastAPI(title="Abhijan FastAPI", version="1.0.0")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello from Abhijan FastAPI"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.on_event("startup")
async def on_startup() -> None:
    await init_db()