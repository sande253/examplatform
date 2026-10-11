from sqlalchemy.orm import Session
from app.models.test import TestAttempt
from app.models.paper import PaperQuestion
from decimal import Decimal

def score_attempt(attempt: TestAttempt, db: Session):
    total_score = Decimal('0.0')
    max_score = Decimal('0.0')
    correct = 0
    incorrect = 0
    unanswered = 0
    topic_perf = {}

    paper_questions = db.query(PaperQuestion).filter(PaperQuestion.paper_id == attempt.test_instance.paper_id).all()
    pq_map = {str(pq.question_id): pq for pq in paper_questions}

    for answer in attempt.answers:
        q_id = str(answer.question_id)
        pq = pq_map.get(q_id)
        if not pq:
            continue
        
        q = pq.question
        m = pq.marks_override if pq.marks_override is not None else q.marks
        nm = pq.negative_marks_override if pq.negative_marks_override is not None else q.negative_marks
        
        max_score += m
        topic = q.topic or "Uncategorized"
        if topic not in topic_perf:
            topic_perf[topic] = {"total": 0, "correct": 0, "score": 0}
        topic_perf[topic]["total"] += 1

        if answer.selected_answer is None:
            unanswered += 1
            answer.is_correct = None
            answer.marks_awarded = Decimal('0.0')
        else:
            selected = str(answer.selected_answer).strip().lower()
            expected = str(q.correct_answer).strip().lower()
            aliases = {
                "true": {"true", "t", "yes", "1"},
                "false": {"false", "f", "no", "0"},
            }
            is_correct = selected == expected
            if not is_correct:
                for canonical, names in aliases.items():
                    if expected in names and selected in names:
                        is_correct = True
                        break
                if not is_correct:
                    for option in q.options:
                        if expected in {option.option_key.lower(), option.option_text.strip().lower()}:
                            is_correct = selected in {option.option_key.lower(), option.option_text.strip().lower()}
                            break
            answer.is_correct = is_correct
            if is_correct:
                correct += 1
                answer.marks_awarded = m
                total_score += m
                topic_perf[topic]["correct"] += 1
                topic_perf[topic]["score"] += float(m)
            else:
                incorrect += 1
                answer.marks_awarded = -nm
                total_score -= nm
                topic_perf[topic]["score"] -= float(nm)

    attempt.score = total_score
    attempt.max_score = max_score
    if max_score > 0:
        attempt.percentage = (total_score / max_score) * 100
    attempt.correct_count = correct
    attempt.incorrect_count = incorrect
    attempt.unanswered_count = unanswered
    attempt.topic_performance = topic_perf
