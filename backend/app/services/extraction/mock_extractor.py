import uuid
from typing import List

class MockExtractor:
    def extract(self, text: str) -> List[dict]:
        return [
            {
                "question_text": "What is 2 + 2?",
                "question_type": "MCQ_SINGLE",
                "subject": "Math",
                "difficulty": "EASY",
                "correct_answer": "4",
                "options": [
                    {"option_key": "A", "option_text": "3", "order_index": 1},
                    {"option_key": "B", "option_text": "4", "order_index": 2},
                    {"option_key": "C", "option_text": "5", "order_index": 3},
                    {"option_key": "D", "option_text": "6", "order_index": 4}
                ]
            },
            {
                "question_text": "The Earth is flat.",
                "question_type": "TRUE_FALSE",
                "subject": "Science",
                "difficulty": "EASY",
                "correct_answer": "False",
                "options": []
            },
            {
                "question_text": "Solve for x: 2x = 10",
                "question_type": "NUMERICAL",
                "subject": "Math",
                "difficulty": "MEDIUM",
                "correct_answer": "5",
                "options": []
            }
        ]
