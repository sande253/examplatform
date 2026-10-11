import os
import shutil
from fastapi import UploadFile
from app.core.config import settings

class LocalStorage:
    def __init__(self):
        self.base_path = settings.LOCAL_STORAGE_PATH
        os.makedirs(self.base_path, exist_ok=True)

    def save_file(self, file: UploadFile, filename: str) -> str:
        file_path = os.path.join(self.base_path, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return file_path

    def get_file_path(self, filename: str) -> str:
        return os.path.join(self.base_path, filename)
