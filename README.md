# AI-Powered Question Paper & Exam Platform

A full-stack web application for uploading question papers, AI-powered question extraction, and randomized practice tests with freemium access.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, Python 3.11 |
| Database | PostgreSQL 15 |
| Queue | Redis + Celery |
| AI | Groq (llama-3.1-8b-instant) |
| OCR | Tesseract |
| Payments | Juspay HyperCheckout (mock adapter for dev) |

## Quick Start

### 1. Prerequisites

- Docker Desktop
- Node.js 18+
- Python 3.11+
- Tesseract OCR (for PDF processing)

**Install Tesseract (Windows):**
Download from: https://github.com/UB-Mannheim/tesseract/wiki

### 2. Start the database

```bash
cd examplatform
docker compose up -d db redis
```

### 3. Set up the backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env if needed (defaults work for local dev)

# Run migrations
alembic upgrade head

# Seed the database (creates admin + sample data)
python scripts/seed_db.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs: http://localhost:8000/docs

### 4. Set up the frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment
cp .env.example .env.local
# Edit .env.local if needed

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000

### 5. (Optional) Start Celery worker for PDF processing

```bash
cd backend
celery -A app.workers.celery_app worker --loglevel=info
```

---

## Default Credentials

| Role | Email | Password |
|------|-------|---------|
| Admin | admin@examplatform.com | Admin@123 |
| Student | student@example.com | Student@123 |

---

## Development with Mock Adapters

By default, both `USE_MOCK_EXTRACTOR=true` and `USE_MOCK_PAYMENT=true` are set.

- **Mock Extractor**: Uploads PDFs and returns 5 sample questions without calling Groq.
- **Mock Payment**: Opens a mock payment page at `/mock-payment/{orderId}`. Click "Pay Now" to simulate a successful payment.

To use real Groq extraction:
1. Get a free API key at https://console.groq.com
2. Set `GROQ_API_KEY=your-key` in `.env`
3. Set `USE_MOCK_EXTRACTOR=false`

---

## Plans

| Feature | FREE | PREMIUM (₹199/mo) |
|---------|------|-------------------|
| Free papers | ✅ | ✅ |
| Premium papers | ❌ | ✅ |
| Tests per month | 5 | Unlimited |
| Full analytics | ❌ | ✅ |
| Detailed explanations | ❌ | ✅ |

---

## Project Structure

```
examplatform/
├── backend/            # FastAPI backend
│   ├── app/
│   │   ├── api/        # Endpoints
│   │   ├── models/     # SQLAlchemy models
│   │   ├── schemas/    # Pydantic schemas
│   │   ├── services/   # Business logic
│   │   └── workers/    # Celery tasks
│   ├── alembic/        # Migrations
│   ├── scripts/        # Seed + admin scripts
│   └── tests/          # pytest test suite
├── frontend/           # Next.js frontend
│   └── src/
│       ├── app/        # Pages (App Router)
│       ├── components/ # Reusable components
│       └── lib/        # API client, auth, types
├── docker-compose.yml
└── .env.example
```

---

## Running Tests

```bash
cd backend
pytest tests/ -v --cov=app
```
