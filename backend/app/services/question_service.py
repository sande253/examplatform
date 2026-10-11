from sqlalchemy.orm import Session
from app.models.question import Question, QuestionOption
from app.schemas.question import QuestionCreate, QuestionUpdate
from uuid import UUID

def create_question(db: Session, question_in: QuestionCreate, user_id: str) -> Question:
    q_data = question_in.model_dump(exclude={"options"})
    db_obj = Question(**q_data, created_by=user_id)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    if question_in.options:
        for opt in question_in.options:
            db_opt = QuestionOption(**opt.model_dump(), question_id=db_obj.id)
            db.add(db_opt)
        db.commit()
        db.refresh(db_obj)
    return db_obj

def get_question(db: Session, question_id: UUID) -> Question:
    return db.query(Question).filter(Question.id == question_id).first()
