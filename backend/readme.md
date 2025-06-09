# Quizzy Backend

A robust backend for managing users, PDF uploads, quiz/exam generation, analytics, and more.

- **Quiz Generator API**: RESTful endpoints for user management, PDF upload, quiz creation, and analytics.
- **Webhook Integration**: Receives results from external processing servers for PDF and quiz generation.

---

## 🚀 Features

- 👤 User registration, login, and JWT-based authentication
- 📄 Upload and manage PDFs
- 📝 Generate quizzes by topic, page range, or across multiple PDFs
- 📥 Download and manage generated quizzes and questions
- 📊 User dashboard and detailed analytics (exam, user, question, and participation stats)
- 🔄 Webhook endpoints for real-time updates from processing servers
- 🔐 Secure access to all endpoints via JWT
- 🗑️ Soft-delete for users, uploads, exams, and answers

---

## 🧩 Architecture Overview

- **FastAPI**: Main web framework for REST APIs
- **SQLAlchemy**: ORM for MySQL database
- **MySQL**: Persistent storage for users, uploads, exams, questions, answers, and analytics
- **Async HTTP**: Communicates with external processing servers for PDF and quiz generation
- **Webhooks**: Receives callbacks for PDF processing and quiz generation completion

---

## ⚙️ Setup Instructions

### Prerequisites

- Python 3.12+
- MySQL 8+
- (Recommended) Docker & Docker Compose

### 1. Clone the Repository

```bash
git clone <backend-repo-url>
cd Quizzy/backend
```

### 2. Configure Database

The default connection string is in `app/database.py`:
```
mysql+pymysql://root:123321@localhost:3306/BlogApplication
```
- **User:** root
- **Password:** 123321
- **Database:** BlogApplication
- **Host:** localhost (or `mysql` if using Docker Compose)

> For production, use environment variables and a `.env` file.

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
   CREATE DATABASE BlogApplication;
   ```
2. Run the FastAPI app:
   ```bash
   uvicorn app.main:app --reload
   ```

---

## 🔐 Authentication Flow

- Register and login via `/register` and `/login`
- JWT tokens are issued and required for all protected endpoints
- Tokens are used for PDF upload, quiz creation, analytics, and more

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

---

## 📦 Tech Stack

- **FastAPI** – Web framework
- **SQLAlchemy** – ORM
- **MySQL** – Database
- **Uvicorn** – ASGI server
- **httpx** – Async HTTP client for background jobs
- **PyJWT / python-jose** – JWT authentication
- **passlib** – Password hashing

---

## 🧪 Testing

> Add tests for auth, upload, quiz creation, analytics, and webhooks.

---

## 🛠️ Development Notes

- Use environment variables for secrets and DB config in production
- All endpoints (except registration/login) require JWT
- Webhook endpoints are called by external processing servers
- See `app/main.py` for all API routes and logic

---

For more details, see the code in the `app/` directory. 