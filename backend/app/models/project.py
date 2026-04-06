def project_model(project) -> dict:
    return {
        "id": str(project["_id"]),
        "title": project["title"],
        "description": project["description"],
        "status": project["status"],
        "user_id": str(project["user_id"])
    }
