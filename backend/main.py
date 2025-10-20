from fastapi import FastAPI
from src.routes import folders, files, data_rooms
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config import settings
from fastapi_limiter import FastAPILimiter
import redis.asyncio as redis
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    r = await redis.Redis(
        host=settings.REDIS_DOMAIN,
        port=settings.REDIS_PORT,
        password=settings.REDIS_PASSWORD,
        db=0,
        encoding="utf-8",
        decode_responses=True
    )
    await FastAPILimiter.init(r)
    yield
    # Shutdown (cleanup if needed)
    await r.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_rooms.router, prefix='/api')
app.include_router(folders.router, prefix='/api')
app.include_router(files.router, prefix='/api')

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

