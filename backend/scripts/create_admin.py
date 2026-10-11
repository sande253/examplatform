import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

def create_admin():
    db = SessionLocal()
    existing = db.query(User).filter(User.email == "admin@examplatform.com").first()
    if not existing:
        admin = User(
            email="admin@examplatform.com",
            name="Admin User",
            hashed_password=hash_password("Admin@123"),
            role=UserRole.admin
        )
        db.add(admin)
        db.commit()
        print("Admin user created.")
    else:
        print("Admin user already exists.")

if __name__ == "__main__":
    create_admin()
