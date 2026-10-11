"""Vercel serverless function entry point."""
from app.main import app

# Vercel will use this as the handler
handler = app
