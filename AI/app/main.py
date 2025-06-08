from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import pdf_router, webhook_router
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="RAG Quiz System",
    description="A RAG-based system for PDF interaction and quiz generation using OpenAI and LangChain",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - configure according to your needs
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pdf_router.router)
app.include_router(webhook_router.router)

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "RAG Quiz System API",
        "version": "1.0.0",
        "description": "Upload PDFs via uploadthing URLs, chat with them, and generate quizzes with background processing",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "pdf_upload": "/pdf/upload",
            "pdf_chat": "/pdf/chat",
            "pdf_chat_stream": "/pdf/chat/stream",
            "generate_quiz": "/pdf/generate-quiz",
            "job_status": "/pdf/job/{job_id}/status",
            "queue_info": "/pdf/queue/info",
            "pdf_webhook": "/webhook/upload-processed/{upload_id}",
            "quiz_webhook": "/webhook/quiz-generated/{exam_id}"
        },
        "features": {
            "queue_processing": "PDF uploads and quiz generation are processed in background queues",
            "webhook_notifications": "Automatic webhook notifications when processing completes",
            "job_monitoring": "Track status of queued jobs",
            "quiz_generation": "Generate quizzes asynchronously with exam_id tracking"
        }
    }

@app.get("/health")
async def health_check():
    """Global health check endpoint"""
    try:
        # Check if OpenAI API key is set
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key or openai_key == "your_openai_api_key_here":
            return {
                "status": "unhealthy",
                "error": "OpenAI API key not configured"
            }
        
        # Check queue service status
        queue_status = "not_configured"
        try:
            from .services.queue_service import QueueService
            queue_service = QueueService()
            queue_info = queue_service.get_queue_info()
            queue_status = "operational"
        except Exception as e:
            logger.warning(f"Queue service check failed: {e}")
            queue_status = "unavailable"
        
        return {
            "status": "healthy",
            "message": "RAG Quiz System is running",
            "services": {
                "api": "operational",
                "openai_configured": bool(openai_key),
                "queue_service": queue_status
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting RAG Quiz System...")
    
    # Check required environment variables
    required_vars = ["OPENAI_API_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var) or os.getenv(var) == f"your_{var.lower()}_here":
            missing_vars.append(var)
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        logger.error("Please set these variables in your .env file")
    else:
        logger.info("All required environment variables are set")
    
    logger.info("RAG Quiz System started successfully")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down RAG Quiz System...")

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    ) 