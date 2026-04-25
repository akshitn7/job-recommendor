from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.recommend import router as recommend_router
from db.queries import load_skill_embeddings


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.skill_embeddings = load_skill_embeddings()
    print("[startup] Skill embeddings loaded.")
    yield


app = FastAPI(title="HireAble", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommend_router, prefix="/api")


@app.get("/")
def root():
    return {"status": "HireAble is running"}