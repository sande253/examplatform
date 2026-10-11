"""Vercel serverless function entry point."""
from app.main import app
from mangum import Mangum

# Mangum adapter for AWS Lambda/Vercel
handler = Mangum(app, lifespan="off")
