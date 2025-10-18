from fastapi import FastAPI
from src.routes import folders, files, data_rooms
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

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

