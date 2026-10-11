from typing import List
from app.core.config import settings
import json
import re
import logging

logger = logging.getLogger(__name__)


class GroqExtractor:
    def __init__(self):
        from groq import Groq
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL

    def extract(self, text: str) -> List[dict]:
        if not settings.GROQ_API_KEY:
            raise Exception("GROQ_API_KEY is not set.")

        # Keep enough context for multi-question exam papers without overflowing context.
        snippet = text[:12000]

        prompt = f"""Extract exam questions from the following text and output ONLY a valid JSON array.
Each object must have these keys:
- question_text (string)
- question_type: one of MCQ_SINGLE, MCQ_MULTIPLE, TRUE_FALSE, NUMERICAL, OPEN
- subject (string or null)
- difficulty: one of EASY, MEDIUM, HARD
- correct_answer (string or list for multi-select; for MCQ use the option_key like "A")
- options: array of {{"option_key":"A","option_text":"...","order_index":1}} for MCQ types, otherwise []

Do not wrap the JSON in markdown. Output the array only.

Text:
{snippet}
"""

        chat_completion = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You extract structured exam questions. Respond with JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
            model=self.model,
            temperature=0.1,
        )

        response_content = chat_completion.choices[0].message.content or ""
        parsed = self._parse_json_array(response_content)
        if not parsed:
            logger.warning("Groq returned no parseable questions. Raw response: %s", response_content[:500])
        return parsed

    def _parse_json_array(self, content: str) -> List[dict]:
        # Strip common markdown fences before locating the array.
        cleaned = re.sub(r"```(?:json)?\s*", "", content).replace("```", "").strip()
        start = cleaned.find("[")
        end = cleaned.rfind("]")
        if start == -1 or end == -1 or end <= start:
            return []
        try:
            data = json.loads(cleaned[start : end + 1])
            return data if isinstance(data, list) else []
        except json.JSONDecodeError:
            return []
