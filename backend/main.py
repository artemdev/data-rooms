from fastapi import FastAPI
from src.routes import folders, files, data_rooms
import uvicorn

app = FastAPI()

app.include_router(data_rooms.router, prefix='/api')
app.include_router(folders.router, prefix='/api')
app.include_router(files.router, prefix='/api')

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
