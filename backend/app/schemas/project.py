from pydantic import BaseModel
from typing import Optional, Literal

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Literal["active", "completed"] = "active"

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Literal["active", "completed"]] = None