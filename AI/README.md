# RAG Quiz System

A powerful RAG-based system for PDF interaction and quiz generation using FastAPI, OpenAI, LangChain, and Chroma vector database. Upload PDFs via uploadthing URLs, chat with them, and generate customized quizzes.

## Features

- **PDF Processing**: Upload PDFs from uploadthing URLs and extract text content
- **Background Queue Processing**: PDF uploads are processed asynchronously using Redis Queue (RQ)
- **Webhook Notifications**: Automatic notifications when PDF processing completes
- **Job Monitoring**: Track the status of queued PDF processing jobs
- **RAG Chat**: Interactive conversations with PDF content using retrieval-augmented generation
- **Quiz Generation**: Three types of quiz generation:
  1. **Page Range Quiz**: Generate quizzes from specific page ranges
  2. **Topic Quiz**: Generate quizzes focused on specific topics within a PDF
  3. **Multi-PDF Topic Quiz**: Generate quizzes from topics across multiple PDFs
- **Vector Search**: Efficient semantic search using Chroma vector database
- **OpenAI Integration**: Powered by GPT-3.5-turbo for intelligent responses and quiz generation

## Project Structure

```
Quizzy/AI/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── pdf_service.py      # PDF processing
│   │   ├── vector_service.py   # Vector database operations
│   │   ├── rag_service.py      # RAG and quiz generation
│   │   ├── queue_service.py    # Queue management
│   │   ├── pdf_processing_worker.py  # Background worker functions
│   │   └── quiz_processing_worker.py  # Quiz processing worker
│   └── routers/
│       ├── __init__.py
│       ├── pdf_router.py       # PDF API endpoints
│       └── webhook_router.py   # Webhook endpoints
├── worker.py                   # Background worker script
├── requirements.txt
├── .env                        # Environment variables
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── setup.py
├── setup_dev.py
├── test_quiz_queue.py
├── test_system.py
└── README.md
```

## Installation and Setup

### Prerequisites

- Python 3.8 or higher
- OpenAI API key
- Redis Server (for background queue processing)
- Internet connection for downloading PDFs

### 1. Clone and Setup

```bash
# Clone the repository (or create the files as provided)
cd Quizzy/AI

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Install and Start Redis

**On Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**On macOS:**

```bash
brew install redis
brew services start redis
```

**On Windows:**
Download and install from: https://redis.io/download

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
CHROMA_DB_PATH=./chroma_db
LOG_LEVEL=INFO

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
# REDIS_PASSWORD=your_redis_password_here  # If Redis requires auth
```

**Important**: Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 4. Run the Application

```bash
# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# In a separate terminal, start the background worker
python worker.py
```

The API will be available at:

- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Background Processing Workflow

This system implements an asynchronous queue-based processing workflow:

1. **Upload Request**: Client sends PDF upload request to `/pdf/upload`
2. **Immediate Response**: API immediately returns with `job_id`, `pdf_id`, and queue status
3. **Background Processing**: Worker processes the PDF (download, extract text, vectorize)
4. **Webhook Notification**: Upon completion, webhook is sent to `/webhook/upload-processed/{upload_id}`
5. **Status Monitoring**: Client can check job status anytime via `/pdf/job/{job_id}/status`

### Queue Management

- **Start Worker**: `python worker.py`
- **Burst Mode**: `python worker.py --burst` (processes all jobs then exits)
- **Custom Worker Name**: `python worker.py --name my-worker`
- **Monitor Queue**: Check `/pdf/queue/info` for queue statistics

## API Endpoints

### 1. Upload PDF

Queue a PDF for processing from uploadthing URL. The PDF will be processed in the background and a webhook notification will be sent when complete.

**POST** `/pdf/upload`

```json
{
  "uploadthing_url": "https://uploadthing.com/f/your-pdf-url",
  "upload_id": 1,
  "pdf_name": "Optional PDF name"
}
```

**Response:**

```json
{
  "job_id": "job-uuid-string",
  "pdf_id": "pdf-uuid-string",
  "message": "PDF upload queued for processing",
  "upload_id": 1,
  "status": "queued"
}
```

### 2. Check Job Status

Monitor the status of a queued PDF processing job.

**GET** `/pdf/job/{job_id}/status`

**Response:**

```json
{
  "job_id": "job-uuid-string",
  "status": "finished",
  "created_at": "2024-01-01T12:00:00Z",
  "started_at": "2024-01-01T12:00:05Z",
  "ended_at": "2024-01-01T12:01:30Z",
  "result": {
    "pdf_id": "pdf-uuid-string",
    "upload_id": 1,
    "total_pages": 10,
    "pdf_name": "document.pdf",
    "status": "success",
    "message": "PDF processed successfully"
  },
  "error": null,
  "meta": {}
}
```

### 3. Webhook Notifications

When PDF processing completes, a webhook is automatically sent to:
`http://localhost:8000/webhook/upload-processed/{upload_id}`

**Webhook Payload (Success):**

```json
{
  "upload_id": 1,
  "success": true,
  "timestamp": "2024-01-01T12:01:30Z",
  "pdf_id": "pdf-uuid-string",
  "total_pages": 10,
  "pdf_name": "document.pdf",
  "message": "PDF processed successfully"
}
```

**Webhook Payload (Failure):**

```json
{
  "upload_id": 1,
  "success": false,
  "timestamp": "2024-01-01T12:01:30Z",
  "error": "Error message describing what went wrong"
}
```

### 4. Chat with PDF

Have conversations with uploaded PDFs.

**POST** `/pdf/chat`

```json
{
  "pdf_ids": ["your-pdf-id"],
  "message": "What is the main topic of this document?",
  "conversation_history": [
    { "role": "user", "content": "Previous question" },
    { "role": "assistant", "content": "Previous answer" }
  ]
}
```

**Response:**

```json
{
  "response": "The main topic is...",
  "sources": ["Chunk 1", "Chunk 3", "Chunk 7"]
}
```

### 5. Generate Quiz

Generate quizzes based on different criteria.

**POST** `/pdf/generate-quiz`

#### Topic-based Quiz (Single PDF)

```json
{
  "quiz_type": "topic",
  "pdf_ids": ["your-pdf-id"],
  "topic": "machine learning",
  "num_questions": 5,
  "difficulty": "medium"
}
```

#### Page Range Quiz

```json
{
  "quiz_type": "page_range",
  "pdf_ids": ["your-pdf-id"],
  "page_start": 1,
  "page_end": 5,
  "num_questions": 3,
  "difficulty": "easy"
}
```

#### Multi-PDF Topic Quiz

```json
{
  "quiz_type": "multi_pdf_topic",
  "pdf_ids": ["pdf-id-1", "pdf-id-2", "pdf-id-3"],
  "topic": "artificial intelligence",
  "num_questions": 7,
  "difficulty": "hard"
}
```

**Response:**

```json
{
  "quiz_id": "uuid-string",
  "questions": [
    {
      "question": "What is machine learning?",
      "options": [
        "A) A subset of artificial intelligence",
        "B) A type of database",
        "C) A programming language",
        "D) A web framework"
      ],
      "correct_answer": "A) A subset of artificial intelligence",
      "explanation": "Machine learning is indeed a subset of AI that focuses on..."
    }
  ],
  "metadata": {
    "quiz_type": "topic",
    "num_questions": 5,
    "difficulty": "medium",
    "topic": "machine learning",
    "pdf_count": 1
  }
}
```

### 6. Additional Endpoints

- **GET** `/pdf/list` - List all stored PDFs
- **GET** `/pdf/{pdf_id}/info` - Get PDF information
- **DELETE** `/pdf/{pdf_id}` - Delete a PDF
- **DELETE** `/pdf/job/{job_id}` - Cancel a queued job
- **GET** `/pdf/queue/info` - Get queue status information
- **GET** `/webhook/test/{upload_id}` - Test webhook endpoint
- **GET** `/health` - Health check

## Testing the System

### 1. Using curl

```bash
# 1. Upload a PDF
curl -X POST "http://localhost:8000/pdf/upload" \
  -H "Content-Type: application/json" \
  -d '{
    "uploadthing_url": "https://your-uploadthing-url.pdf",
    "pdf_name": "test-document.pdf"
  }'

# 2. Chat with the PDF (replace PDF_ID with actual ID from upload response)
curl -X POST "http://localhost:8000/pdf/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "pdf_ids": ["YOUR_PDF_ID"],
    "message": "What are the key points in this document?",
    "conversation_history": []
  }'

# 3. Generate a quiz
curl -X POST "http://localhost:8000/pdf/generate-quiz" \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_type": "topic",
    "pdf_ids": ["YOUR_PDF_ID"],
    "topic": "main concepts",
    "num_questions": 3,
    "difficulty": "medium"
  }'
```

### 2. Using Python requests

```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Upload PDF
upload_response = requests.post(f"{BASE_URL}/pdf/upload", json={
    "uploadthing_url": "https://your-uploadthing-url.pdf",
    "pdf_name": "test-document.pdf"
})
pdf_data = upload_response.json()
pdf_id = pdf_data["pdf_id"]
print(f"Uploaded PDF with ID: {pdf_id}")

# Chat with PDF
chat_response = requests.post(f"{BASE_URL}/pdf/chat", json={
    "pdf_id": pdf_id,
    "message": "Summarize the main points of this document",
    "conversation_history": []
})
chat_data = chat_response.json()
print(f"Chat response: {chat_data['response']}")

# Generate quiz
quiz_response = requests.post(f"{BASE_URL}/pdf/generate-quiz", json={
    "quiz_type": "topic",
    "pdf_ids": [pdf_id],
    "topic": "key concepts",
    "num_questions": 5,
    "difficulty": "medium"
})
quiz_data = quiz_response.json()
print(f"Generated quiz with {len(quiz_data['questions'])} questions")

# Print first question
if quiz_data['questions']:
    q = quiz_data['questions'][0]
    print(f"\nSample Question: {q['question']}")
    for option in q['options']:
        print(f"  {option}")
    print(f"Correct Answer: {q['correct_answer']}")
```

### 3. Using the Interactive Docs

1. Open http://localhost:8000/docs
2. Try the endpoints in order:
   - First upload a PDF using `/pdf/upload`
   - Copy the returned `pdf_id`
   - Use the `pdf_id` to chat with `/pdf/chat`
   - Generate quizzes with `/pdf/generate-quiz`

## Configuration Options

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `CHROMA_DB_PATH`: Path for Chroma vector database (default: `./chroma_db`)
- `LOG_LEVEL`: Logging level (default: `INFO`)
- `HOST`: Server host (default: `0.0.0.0`)
- `PORT`: Server port (default: `8000`)

### Quiz Parameters

- **Quiz Types**: `page_range`, `topic`, `multi_pdf_topic`
- **Difficulty Levels**: `easy`, `medium`, `hard`
- **Question Count**: 1-20 questions per quiz
- **Page Range**: Any valid page range within the PDF

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**

   - Ensure your API key is correctly set in `.env`
   - Check that you have sufficient OpenAI credits

2. **PDF Download Fails**

   - Verify the uploadthing URL is accessible
   - Check that the URL points to a valid PDF file

3. **Vector Database Issues**

   - Ensure the `chroma_db` directory has write permissions
   - Try deleting the `chroma_db` folder and restarting

4. **Memory Issues with Large PDFs**
   - The system processes PDFs in chunks to handle large files
   - For very large PDFs, consider splitting them into smaller files

### Logs

Check the application logs for detailed error messages:

```bash
# Run with debug logging
LOG_LEVEL=DEBUG uvicorn app.main:app --reload
```

## Development

### Adding New Features

1. **New Quiz Types**: Extend the `QuizType` enum and add handling in `RAGService`
2. **Additional PDF Sources**: Modify `PDFService` to support other URL formats
3. **Different LLM Models**: Update the model configuration in `RAGService`

### Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests (you'll need to create test files)
pytest tests/
```

## Production Deployment

### Security Considerations

1. Update CORS settings in `main.py`
2. Set up proper authentication
3. Use environment-specific configuration
4. Set up monitoring and logging

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## License

This project is open source. Add your preferred license here.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For issues and questions:

- Check the troubleshooting section
- Review the logs for error details
- Open an issue with detailed information about your problem
