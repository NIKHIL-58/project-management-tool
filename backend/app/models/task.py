def task_model(task) -> dict:
    return {
        "id": str(task["_id"]),
        "title": task["title"],
        "description": task["description"],
        "status": task["status"],
        "due_date": task.get("due_date"),
        "project_id": str(task["project_id"])
    }
