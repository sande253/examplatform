"""Vercel serverless entry point."""
from app.main import app

app = app  # Export for Vercel
