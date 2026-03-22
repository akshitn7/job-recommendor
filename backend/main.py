# FastAPI application entry point. Initializes the app, registers all routes, configures CORS 
# to allow frontend requests, and starts the Uvicorn server.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.recommend import router as recommend_router
 
app = FastAPI(
    title="HireAble",
    description="AI powered job recommendation system",
    version="1.0.0"
)
 
# CORS — allows frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
 
# routes
app.include_router(recommend_router, prefix="/api")
 
@app.get("/")
def root():
    return {"status": "HireAble is running"}