import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User, UserRole
from app.models.subscription import Plan
from app.models.question import Question, QuestionOption, QuestionType, Difficulty
from app.models.paper import Paper, PaperQuestion, AccessType, PaperType
from app.core.security import hash_password

def seed_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Admin User
    admin = User(email="admin@examplatform.com", name="Admin", hashed_password=hash_password("Admin@123"), role=UserRole.admin)
    student = User(email="student@example.com", name="Student", hashed_password=hash_password("Student@123"), role=UserRole.student)
    db.add(admin)
    db.add(student)

    # Plans
    free_plan = Plan(name="FREE", price_inr=0, duration_days=3650, max_tests_per_month=5, access_premium_papers=False)
    prem_month = Plan(name="PREMIUM_MONTHLY", price_inr=199, duration_days=30, access_premium_papers=True)
    prem_year = Plan(name="PREMIUM_YEARLY", price_inr=999, duration_days=365, access_premium_papers=True)
    db.add_all([free_plan, prem_month, prem_year])
    
    db.commit()

    # Create dummy questions and papers
    subjects = ["Physics", "Chemistry", "Mathematics", "Biology"]
    questions = []
    for i in range(30):
        from app.models.question import ApprovalStatus
        q = Question(
            question_text=f"Sample Question {i}",
            question_type=QuestionType.MCQ_SINGLE,
            subject=subjects[i % 4],
            difficulty=Difficulty.MEDIUM,
            correct_answer="A",
            created_by=admin.id,
            approval_status=ApprovalStatus.APPROVED,
        )
        db.add(q)
        db.commit()
        db.refresh(q)
        questions.append(q)

        opts = [
            QuestionOption(question_id=q.id, option_key="A", option_text="Option A", order_index=1),
            QuestionOption(question_id=q.id, option_key="B", option_text="Option B", order_index=2),
        ]
        db.add_all(opts)
        db.commit()

    # Papers
    from app.models.paper import PaperStatus
    paper1 = Paper(
        title="Free Sample Test 1",
        duration_minutes=60,
        total_questions=10,
        total_marks=10,
        access_type=AccessType.FREE,
        status=PaperStatus.PUBLISHED,
        created_by=admin.id,
    )
    db.add(paper1)
    db.commit()
    db.refresh(paper1)

    for i in range(10):
        db.add(PaperQuestion(paper_id=paper1.id, question_id=questions[i].id, order_index=i+1))
    db.commit()

    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
