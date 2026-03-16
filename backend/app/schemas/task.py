from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Literal["todo", "in-progress", "done"] = "todo"
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Literal["todo", "in-progress", "done"]] = None
    due_date: Optional[datetime] = None