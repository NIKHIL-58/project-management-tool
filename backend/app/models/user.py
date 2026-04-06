from bson import ObjectId

def user_model(user) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "password": user["password"]
    }
