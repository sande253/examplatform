from .local_storage import LocalStorage
from app.core.config import settings

def get_storage():
    return LocalStorage()
