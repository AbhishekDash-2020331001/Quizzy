# Quizzy Backend

A robust backend for managing users, PDF uploads, quiz/exam generation, analytics, and more.

- **Quiz Generator API**: RESTful endpoints for user management, PDF upload, quiz creation, and analytics.
- **Webhook Integration**: Receives results from external processing servers for PDF and quiz generation.
- **Payment System (Stripe)**: Secure credit purchase (1:1 ratio) via Stripe, with webhook integration for real-time updates.

---

## 🚀 Features

- 👤 User registration, login, and JWT-based authentication
- 📄 Upload and manage PDFs
- 📝 Generate quizzes by topic, page range, or across multiple PDFs
- 📥 Download and manage generated quizzes and questions
- 📊 User dashboard and detailed analytics (exam, user, question, and participation stats)
- 🔄 Webhook endpoints for real-time updates from processing servers (PDF processing, quiz generation, and payment events)
- 🔐 Secure access to all endpoints via JWT
- 🗑️ Soft-delete for users, uploads, exams, and answers
- 💳 Secure payment (Stripe) for purchasing credits (1:1 ratio) and real-time credit balance updates

---

## 🧩 Architecture Overview

- **FastAPI**: Main web framework for REST APIs
- **SQLAlchemy**: ORM for MySQL database
- **MySQL**: Persistent storage (users, uploads, exams, questions, answers, analytics, and payment records)
- **Async HTTP**: Communicates with external processing servers for PDF and quiz generation
- **Webhooks**: Receives callbacks for PDF processing, quiz generation, and Stripe payment events
- **Stripe**: Secure payment processing (payment intents, webhooks, and credit purchases)

---

## ⚙️ Setup Instructions

### Prerequisites

- Python 3.12+
- MySQL 8+
- (Recommended) Docker & Docker Compose
- Stripe account (for payment integration)

### 1. Clone the Repository

```bash
git clone <backend-repo-url>
cd Quizzy/backend
```

### 2. Configure Database

The default connection string (as defined in `app/database.py`) is:

```
mysql+pymysql://root:abcd@localhost:3306/quizzy
```

- **User:** root
- **Password:** abcd
- **Database:** quizzy
- **Host:** localhost (or `mysql` if using Docker Compose)

> For production, use environment variables and a `.env` file (e.g. for Stripe keys).

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run with Docker Compose (Recommended)

```bash
docker compose -f compose.yml up --build
```
- FastAPI backend: [http://localhost:8000](http://localhost:8000)
- MySQL: port 3306 (internal: `mysql:3306`)

### 5. Manual Setup (without Docker)

1. Start MySQL and create the database:
   ```sql
   CREATE DATABASE quizzy;
   ```
2. Run the FastAPI app:
   ```bash
   uvicorn app.main:app --reload
   ```

---

## 🔐 Authentication Flow

- Register and login via `/register` and `/login`
- JWT tokens are issued and required for all protected endpoints (except Stripe webhook)
- Tokens are used for PDF upload, quiz creation, analytics, and payment endpoints.

---

## 📚 Features In Detail

### 🔸 User & Auth

- Register, login, change password, soft-delete account
- JWT-based authentication for all protected endpoints

### 🔸 PDF Upload & Processing

- Upload PDFs (URL-based)
- Background job sends PDF to processing server
- Webhook receives processed PDF info (pages, pdf_id)

### 🔸 Quiz & Exam Management

- Create quizzes by topic, page range, or across multiple PDFs
- Background job sends exam info to processing server
- Webhook receives generated questions and attaches them to the exam
- Retake, time window, and difficulty options

### 🔸 Question & Answer Management

- CRUD for questions and answers
- Bulk answer submission and scoring
- Soft-delete for questions and answers

### 🔸 Analytics & Dashboard

- Exam analytics: participation, scores, question stats, completion rates
- User analytics: performance, streaks, accuracy, subject breakdown
- Rankings and detailed take results

### 🔸 Webhooks & Real-Time Updates

- `/webhook/upload-processed/{upload_id}`: Receives PDF processing results
- `/webhook/quiz-generated/{exam_id}`: Receives generated quiz questions
- `/payments/webhook`: Receives Stripe payment events (payment_intent.succeeded, payment_intent.payment_failed)

### 🔸 Payment (Stripe) & Credit System

- Purchase credits (1:1 ratio) via Stripe (endpoint: `/payments/create-intent`)
- Secure payment intent creation and webhook integration
- Real-time credit balance updates (endpoint: `/credits/balance`)
- Payment history (endpoint: `/payments/history`)
- Credit calculation (endpoint: `/credits/calculate`) (0.1 credits per question)
- **Initial Free Credits:** Every new user receives 10 free credits upon registration.
- **Credit Deduction:** Quiz creation deducts credits (0.1 credits per question) (e.g. 10 questions = 1 credit).

---

## 📦 Tech Stack

- **FastAPI** – Web framework
- **SQLAlchemy** – ORM
- **MySQL** – Persistent storage (users, uploads, exams, questions, answers, analytics, and payment records)
- **Uvicorn** – ASGI server
- **httpx** – Async HTTP client for background jobs
- **PyJWT / python-jose** – JWT authentication
- **passlib** – Password hashing
- **Stripe** – Secure payment processing (payment intents, webhooks, and credit purchases)

---

## 🧪 Testing

> Add tests for auth, upload, quiz creation, analytics, payment (Stripe), and webhooks.

---

## 🛠️ Development Notes

- Use environment variables (e.g. via a `.env` file) for secrets (Stripe keys, DB config) in production.
- All endpoints (except registration/login and Stripe webhook) require JWT.
- Webhook endpoints (PDF, quiz, and Stripe) are called by external processing servers.
- See `app/main.py` for all API routes and logic.

---

## Stripe Payment System

- **Overview:** A credit-based payment system (using Stripe) is integrated. New users receive 10 free credits upon registration.
- **Credit Deduction:** Quiz creation costs 0.1 credits per question (e.g. 10 questions = 1 credit).
- **Payment Integration:** Secure payment (1 dollar = 1 credit) via Stripe (endpoints: `/payments/create-intent`, `/payments/webhook`, and `/payments/history`).
- **Stripe Setup:** (See also `STRIPE_SETUP.md` for details.)  
  - Create a webhook endpoint (e.g. `https://your-domain.com/payments/webhook`) in your Stripe dashboard (events: `payment_intent.succeeded`, `payment_intent.payment_failed`).
  - Obtain your Stripe Secret Key and Webhook Secret (and set them in your `.env` file).
- **Testing:** Use Stripe test cards and (optionally) the Stripe CLI (`stripe listen --forward-to localhost:8000/payments/webhook`) for local testing.

---

For more details, see the code in the `app/` directory. 