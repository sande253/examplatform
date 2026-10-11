from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()

# Import all models here so Alembic can detect them for autogenerate
from app.models import user, document, question, paper, test, subscription # noqa
