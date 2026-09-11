from datetime import datetime
from pydantic import BaseModel


class HealthCheckResponse(BaseModel):
    status: str
    version: str
    environment: str
    database: str
    timestamp: datetime
