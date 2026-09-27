from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str
    database: str
    firebase: str = "configured"
    ai: str
