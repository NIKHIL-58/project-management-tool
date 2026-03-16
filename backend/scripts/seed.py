from app.core.database import users_collection, projects_collection, tasks_collection
from app.core.security import hash_password


def run_seed():
    users_collection.delete_many({"email": "test@example.com"})

    user_result = users_collection.insert_one({
        "email": "test@example.com",
        "password": hash_password("Test@123")
    })
    user_id = str(user_result.inserted_id)

    projects = [
        {
            "title": "Website Redesign",
            "description": "Revamp company site",
            "status": "active",
            "user_id": user_id
        },
        {
            "title": "Mobile App Launch",
            "description": "Prepare app launch tasks",
            "status": "completed",
            "user_id": user_id
        }
    ]

    inserted_projects = []
    for project in projects:
        result = projects_collection.insert_one(project)
        project_id = str(result.inserted_id)
        inserted_projects.append(project_id)

    task_seed = [
        [
            {"title": "Design landing page", "description": "Create hero section", "status": "todo"},
            {"title": "Implement navbar", "description": "Responsive nav", "status": "in-progress"},
            {"title": "Deploy staging", "description": "Push to test env", "status": "done"},
        ],
        [
            {"title": "Finalize onboarding", "description": "Create onboarding screens", "status": "todo"},
            {"title": "Test push notifications", "description": "FCM setup", "status": "in-progress"},
            {"title": "Publish release notes", "description": "Draft store notes", "status": "done"},
        ]
    ]

    for idx, project_id in enumerate(inserted_projects):
        for task in task_seed[idx]:
            task["project_id"] = project_id
            tasks_collection.insert_one(task)

    print("Seed data inserted successfully")

if __name__ == "__main__":
    run_seed()