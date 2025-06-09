# Quizzy Frontend

A unified frontend for interacting with two powerful quiz generation APIs:

- **Quiz Generator API**: Generates multiple-choice questions (MCQs) from uploaded PDF documents.
- **RAG Quiz System**: Enables interactive chat with PDFs and advanced quiz generation using retrieval-augmented generation (RAG) with OpenAI.

## 🚀 Features

- 📄 Upload and manage PDFs
- 🤖 Chat with PDF content (RAG-based)
- 📝 Generate quizzes by topic, page range, or across multiple PDFs
- 🔐 User authentication and secure access
- 📥 View, download, and manage generated quizzes
- 📡 Real-time job status updates and webhook integrations

## 🧩 Architecture Overview

This frontend communicates with **two backends**:

1. **Quiz Generator API** (FastAPI + MySQL + JWT auth)
2. **RAG Quiz System** (FastAPI + Redis + Chroma + OpenAI)

Each service exposes REST APIs that this frontend interacts with via HTTP.

## ⚙️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- `.env` file with backend URLs and API keys

### 1. Clone the Repository

```bash
git clone <frontend-repo-url>
cd Quizzy-frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000           # RAG Quiz System
NEXT_PUBLIC_QUIZ_GEN_API_URL=http://localhost:8001       # Quiz Generator API
```

> Adjust ports as needed if the backend APIs are running on different ports or environments.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The frontend will be accessible at: `http://localhost:3000`

---

## 🔐 Authentication Flow

This app supports JWT-based authentication for the Quiz Generator API:

- Register and login via `/auth`
- Tokens are securely stored in memory/local storage
- Used to authorize PDF upload, quiz creation, and access

---

## 📚 Features In Detail

### 🔸 Quiz Generator API

- **Login/Register**
- **Upload PDF and generate MCQs**
- **Download question and answer sheets**
- **Manage past quizzes**

### 🔸 RAG Quiz System

- **Upload PDFs via uploadthing URL**
- **Chat with your document**
- **Generate quizzes by topic or page range**
- **Monitor background job status**
- **Receive webhook notifications for completed jobs**

---

## 📦 Tech Stack

- **React / Next.js** – Frontend Framework
- **Tailwind CSS** – Styling
- **Axios** – API communication
- **React Query / SWR** – Data fetching and caching
- **JWT** – Auth token handling
- **WebSocket or Polling** – For job status updates

---

## 🧪 Testing

```bash
npm run test
```

> Add tests for auth flows, API integration, quiz rendering, etc.

---

## 🛠️ Development Notes

- Handle API failures and timeouts gracefully
- Abstract API services for both backend systems
- Store API keys and tokens securely

---
