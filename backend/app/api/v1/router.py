from fastapi import APIRouter
from .endpoints import auth, users, documents, questions, papers, tests, history, subscriptions, payments, webhooks, analytics, admin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
api_router.include_router(papers.router, prefix="/papers", tags=["papers"])
api_router.include_router(tests.router, prefix="/tests", tags=["tests"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
