from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from app.core.dependencies import get_current_user
from app.core.database import projects_collection, serialize_doc, serialize_list
from app.schemas.project import ProjectCreate, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("")
def get_projects(
    search: str = Query(default=""),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    current_user=Depends(get_current_user),
):
    query = {
        "user_id": current_user["id"],
        "title": {"$regex": search, "$options": "i"},
    }
    skip = (page - 1) * limit

    data = list(projects_collection.find(query).skip(skip).limit(limit))
    total = projects_collection.count_documents(query)

    return {
        "items": serialize_list(data),
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("")
def create_project(payload: ProjectCreate, current_user=Depends(get_current_user)):
    project = payload.dict()
    project["user_id"] = current_user["id"]

    result = projects_collection.insert_one(project)
    created_project = projects_collection.find_one({"_id": result.inserted_id})

    return serialize_doc(created_project)


@router.get("/{project_id}")
def get_project(project_id: str, current_user=Depends(get_current_user)):
    project = projects_collection.find_one(
        {"_id": ObjectId(project_id), "user_id": current_user["id"]}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return serialize_doc(project)


@router.put("/{project_id}")
def update_project(project_id: str, payload: ProjectUpdate, current_user=Depends(get_current_user)):
    existing = projects_collection.find_one(
        {"_id": ObjectId(project_id), "user_id": current_user["id"]}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")

    updates = {k: v for k, v in payload.dict().items() if v is not None}
    projects_collection.update_one({"_id": ObjectId(project_id)}, {"$set": updates})

    updated = projects_collection.find_one({"_id": ObjectId(project_id)})
    return serialize_doc(updated)


@router.delete("/{project_id}")
def delete_project(project_id: str, current_user=Depends(get_current_user)):
    result = projects_collection.delete_one(
        {"_id": ObjectId(project_id), "user_id": current_user["id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"message": "Project deleted"}