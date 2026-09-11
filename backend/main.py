from fastapi import FastAPI

app = FastAPI(title="AgriMark API", version="0.1.0")

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "agrimark-api"}

@app.get("/")
def root() -> dict:
    return {"name": "AgriMark", "status": "ok", "docs": "/docs"}
