from pymongo import MongoClient
from app.core.config import settings

client = MongoClient(settings.MONGO_URI)
db = client[settings.DATABASE_NAME]

users_collection = db["users"]
projects_collection = db["projects"]
tasks_collection = db["tasks"]


def serialize_doc(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


def serialize_list(docs):
    return [serialize_doc(doc) for doc in docs]