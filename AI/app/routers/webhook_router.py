from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any
import logging
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhook", tags=["Webhooks"])

class WebhookPayload(BaseModel):
    upload_id: int
    success: bool
    timestamp: str
    pdf_id: Optional[str] = None
    total_pages: Optional[int] = None
    pdf_name: Optional[str] = None
    message: Optional[str] = None
    error: Optional[str] = None

class QuizWebhookPayload(BaseModel):
    exam_id: int
    success: bool
    timestamp: str
    quiz_id: Optional[str] = None
    questions: Optional[list] = None
    metadata: Optional[dict] = None
    message: Optional[str] = None
    error: Optional[str] = None

@router.post("/upload-processed/{upload_id}")
async def upload_processed_webhook(upload_id: int, payload: WebhookPayload):
    """
    Webhook endpoint to receive notifications when PDF processing is complete
    
    This endpoint is called by the background worker when PDF processing finishes.
    You can extend this to integrate with your application's notification system.
    """
    try:
        logger.info(f"Received webhook notification for upload_id {upload_id}")
        
        # Validate that upload_id matches
        if payload.upload_id != upload_id:
            raise HTTPException(
                status_code=400, 
                detail=f"Upload ID mismatch: URL has {upload_id}, payload has {payload.upload_id}"
            )
        
        if payload.success:
            logger.info(f"PDF processing completed successfully for upload_id {upload_id}")
            logger.info(f"PDF ID: {payload.pdf_id}, Pages: {payload.total_pages}, Name: {payload.pdf_name}")
            
            # Here you can add your custom logic for successful processing
            # Examples:
            # - Send notification to user
            # - Update database status
            # - Trigger next step in your workflow
            # - Send email/SMS notification
            
            response_data = {
                "status": "received",
                "message": "PDF processing completion notification received successfully",
                "upload_id": upload_id,
                "pdf_id": payload.pdf_id,
                "processed_at": payload.timestamp
            }
            
        else:
            logger.error(f"PDF processing failed for upload_id {upload_id}: {payload.error}")
            
            # Here you can add your custom logic for failed processing
            # Examples:
            # - Send error notification to user
            # - Update database with error status
            # - Trigger retry mechanism
            # - Alert administrators
            
            response_data = {
                "status": "received",
                "message": "PDF processing failure notification received",
                "upload_id": upload_id,
                "error": payload.error,
                "failed_at": payload.timestamp
            }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing webhook for upload_id {upload_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

@router.get("/test/{upload_id}")
async def test_webhook(upload_id: int):
    """
    Test endpoint to simulate webhook notifications
    This is useful for testing your webhook integration
    """
    try:
        # Simulate successful processing webhook
        test_payload = WebhookPayload(
            upload_id=upload_id,
            success=True,
            timestamp="2024-01-01T12:00:00Z",
            pdf_id="test-pdf-id-123",
            total_pages=10,
            pdf_name="test-document.pdf",
            message="PDF processed successfully"
        )
        
        # Call the webhook endpoint
        result = await upload_processed_webhook(upload_id, test_payload)
        
        return {
            "message": f"Test webhook sent for upload_id {upload_id}",
            "result": result
        }
        
    except Exception as e:
        logger.error(f"Error in test webhook for upload_id {upload_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Test webhook failed: {str(e)}")

@router.post("/quiz-generated/{exam_id}")
async def quiz_generated_webhook(exam_id: int, payload: QuizWebhookPayload):
    """
    Webhook endpoint to receive notifications when quiz generation is complete
    
    This endpoint is called by the background worker when quiz generation finishes.
    You can extend this to integrate with your application's notification system.
    """
    try:
        logger.info(f"Received quiz webhook notification for exam_id {exam_id}")
        
        # Validate that exam_id matches
        if payload.exam_id != exam_id:
            raise HTTPException(
                status_code=400, 
                detail=f"Exam ID mismatch: URL has {exam_id}, payload has {payload.exam_id}"
            )
        
        if payload.success:
            logger.info(f"Quiz generation completed successfully for exam_id {exam_id}")
            logger.info(f"Quiz ID: {payload.quiz_id}, Questions: {len(payload.questions) if payload.questions else 0}")
            
            # Here you can add your custom logic for successful quiz generation
            # Examples:
            # - Send notification to user
            # - Update database with quiz data
            # - Trigger next step in your workflow
            # - Send email/SMS notification with quiz results
            
            response_data = {
                "status": "received",
                "message": "Quiz generation completion notification received successfully",
                "exam_id": exam_id,
                "quiz_id": payload.quiz_id,
                "generated_at": payload.timestamp,
                "question_count": len(payload.questions) if payload.questions else 0
            }
            
        else:
            logger.error(f"Quiz generation failed for exam_id {exam_id}: {payload.error}")
            
            # Here you can add your custom logic for failed quiz generation
            # Examples:
            # - Send error notification to user
            # - Update database with error status
            # - Trigger retry mechanism
            # - Alert administrators
            
            response_data = {
                "status": "received",
                "message": "Quiz generation failure notification received",
                "exam_id": exam_id,
                "error": payload.error,
                "failed_at": payload.timestamp
            }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing quiz webhook for exam_id {exam_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Quiz webhook processing failed: {str(e)}")

@router.get("/test-quiz/{exam_id}")
async def test_quiz_webhook(exam_id: int):
    """
    Test endpoint to simulate quiz generation webhook notifications
    This is useful for testing your quiz webhook integration
    """
    try:
        # Simulate successful quiz generation webhook
        test_payload = QuizWebhookPayload(
            exam_id=exam_id,
            success=True,
            timestamp="2024-01-01T12:00:00Z",
            quiz_id="test-quiz-id-123",
            questions=[
                {
                    "question": "What is the capital of France?",
                    "options": ["A) London", "B) Berlin", "C) Paris", "D) Madrid"],
                    "correct_answer": "C) Paris",
                    "explanation": "Paris is the capital and most populous city of France."
                }
            ],
            metadata={
                "quiz_type": "topic",
                "num_questions": 1,
                "difficulty": "easy"
            },
            message="Quiz generated successfully"
        )
        
        # Call the webhook endpoint
        result = await quiz_generated_webhook(exam_id, test_payload)
        
        return {
            "message": f"Test quiz webhook sent for exam_id {exam_id}",
            "result": result
        }
        
    except Exception as e:
        logger.error(f"Error in test quiz webhook for exam_id {exam_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Test quiz webhook failed: {str(e)}")

@router.get("/health")
async def webhook_health():
    """Health check for webhook service"""
    return {
        "status": "healthy",
        "message": "Webhook service is operational",
        "endpoints": {
            "upload_processed": "/webhook/upload-processed/{upload_id}",
            "test": "/webhook/test/{upload_id}"
        }
    } 