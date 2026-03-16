from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from app.core.dependencies import get_current_user
from app.core.database import tasks_collection, projects_collection, serialize_doc, serialize_list
from app.schemas.task import TaskCreate, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/project/{project_id}")
def list_tasks(
    project_id: str,
    status: str | None = Query(default=None),
    current_user=Depends(get_current_user),
):
    project = projects_collection.find_one(
        {"_id": ObjectId(project_id), "user_id": current_user["id"]}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = {"project_id": project_id}
    if status:
        query["status"] = status

    tasks = list(tasks_collection.find(query))
    return serialize_list(tasks)


@router.post("/project/{project_id}")
def create_task(project_id: str, payload: TaskCreate, current_user=Depends(get_current_user)):
    project = projects_collection.find_one(
        {"_id": ObjectId(project_id), "user_id": current_user["id"]}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    task = payload.dict()
    task["project_id"] = project_id

    result = tasks_collection.insert_one(task)
    created_task = tasks_collection.find_one({"_id": result.inserted_id})

    return serialize_doc(created_task)


@router.put("/{task_id}")
def update_task(task_id: str, payload: TaskUpdate, current_user=Depends(get_current_user)):
    task = tasks_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = projects_collection.find_one(
        {"_id": ObjectId(task["project_id"]), "user_id": current_user["id"]}
    )
    if not project:
        raise HTTPException(status_code=403, detail="Forbidden")

    updates = {k: v for k, v in payload.dict().items() if v is not None}
    tasks_collection.update_one({"_id": ObjectId(task_id)}, {"$set": updates})

    updated = tasks_collection.find_one({"_id": ObjectId(task_id)})
    return serialize_doc(updated)


@router.delete("/{task_id}")
def delete_task(task_id: str, current_user=Depends(get_current_user)):
    task = tasks_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    project = projects_collection.find_one(
        {"_id": ObjectId(task["project_id"]), "user_id": current_user["id"]}
    )
    if not project:
        raise HTTPException(status_code=403, detail="Forbidden")

    tasks_collection.delete_one({"_id": ObjectId(task_id)})
    return {"message": "Task deleted"}