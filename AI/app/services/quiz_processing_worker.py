import asyncio
import httpx
import uuid
import logging
from typing import Dict, Any, Optional
from .rag_service import RAGService
from ..models.schemas import QuizType
import os

logger = logging.getLogger(__name__)

def process_quiz_generation(quiz_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Background worker function to process quiz generation
    
    Args:
        quiz_data: Dictionary containing:
            - quiz_type: str
            - pdf_ids: List[str]
            - topic: Optional[str]
            - page_start: Optional[int]
            - page_end: Optional[int]
            - num_questions: int
            - difficulty: str
            - exam_id: int
            - quiz_id: str
    
    Returns:
        Dict containing processing results
    """
    try:
        logger.info(f"Starting quiz generation for exam_id {quiz_data.get('exam_id')}")
        
        # Initialize service
        rag_service = RAGService()
        
        # Extract data
        quiz_type = QuizType(quiz_data["quiz_type"])
        pdf_ids = quiz_data["pdf_ids"]
        topic = quiz_data.get("topic")
        page_start = quiz_data.get("page_start")
        page_end = quiz_data.get("page_end")
        num_questions = quiz_data["num_questions"]
        difficulty = quiz_data["difficulty"]
        exam_id = quiz_data["exam_id"]
        quiz_id = quiz_data["quiz_id"]
        
        # Run the async processing in a synchronous context
        result = asyncio.run(_process_quiz_async(
            rag_service=rag_service,
            quiz_type=quiz_type,
            pdf_ids=pdf_ids,
            topic=topic,
            page_start=page_start,
            page_end=page_end,
            num_questions=num_questions,
            difficulty=difficulty,
            exam_id=exam_id,
            quiz_id=quiz_id
        ))
        
        logger.info(f"Successfully processed quiz generation for exam_id {exam_id}")
        return result
        
    except Exception as e:
        logger.error(f"Error processing quiz generation for exam_id {quiz_data.get('exam_id')}: {e}")
        
        # Send failure webhook
        try:
            asyncio.run(_send_quiz_webhook_notification(quiz_data.get("exam_id"), False, str(e)))
        except Exception as webhook_error:
            logger.error(f"Failed to send failure webhook: {webhook_error}")
        
        raise

async def _process_quiz_async(
    rag_service: RAGService,
    quiz_type: QuizType,
    pdf_ids: list,
    topic: Optional[str],
    page_start: Optional[int],
    page_end: Optional[int],
    num_questions: int,
    difficulty: str,
    exam_id: int,
    quiz_id: str
) -> Dict[str, Any]:
    """
    Async function to handle the actual quiz generation
    """
    try:
        # Generate quiz
        logger.info(f"Generating {quiz_type.value} quiz with {num_questions} questions for exam_id {exam_id}")
        
        questions = await rag_service.generate_quiz(
            quiz_type=quiz_type,
            pdf_ids=pdf_ids,
            topic=topic,
            page_start=page_start,
            page_end=page_end,
            num_questions=num_questions,
            difficulty=difficulty
        )
        
        result = {
            "quiz_id": quiz_id,
            "questions": [
                {
                    "question": q.question,
                    "options": q.options,
                    "correct_answer": q.correct_answer,
                    "explanation": q.explanation
                } for q in questions
            ],
            "metadata": {
                "quiz_type": quiz_type.value,
                "num_questions": len(questions),
                "difficulty": difficulty,
                "topic": topic,
                "pdf_count": len(pdf_ids)
            },
            "exam_id": exam_id,
            "status": "success",
            "message": "Quiz generated successfully"
        }
        
        # Send success webhook
        await _send_quiz_webhook_notification(exam_id, True, None, result)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in async quiz generation: {e}")
        raise

async def _send_quiz_webhook_notification(
    exam_id: int, 
    success: bool, 
    error_message: Optional[str] = None,
    result_data: Optional[Dict[str, Any]] = None
) -> None:
    """
    Send webhook notification to the configured endpoint
    
    Args:
        exam_id: The exam ID
        success: Whether the processing was successful
        error_message: Error message if failed
        result_data: Processing result data if successful
    """
    try:
        webhook_url = f"http://localhost:8000/webhook/quiz-generated/{exam_id}"
        
        # Prepare webhook payload
        payload = {
            "exam_id": exam_id,
            "success": success,
            "timestamp": _get_current_timestamp()
        }
        
        if success and result_data:
            payload.update(result_data)
        else:
            payload["error"] = error_message
        
        # Send webhook with timeout and retries
        timeout = httpx.Timeout(30.0)
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            logger.info(f"Sending webhook notification to {webhook_url}")
            
            # Try sending webhook with retries
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = await client.post(
                        webhook_url,
                        json=payload,
                        headers={"Content-Type": "application/json"}
                    )
                    
                    if response.status_code == 200:
                        logger.info(f"Successfully sent webhook for exam_id {exam_id}")
                        return
                    else:
                        logger.warning(f"Webhook returned status {response.status_code} for exam_id {exam_id}")
                        
                except httpx.TimeoutException:
                    logger.warning(f"Webhook timeout for exam_id {exam_id} (attempt {attempt + 1})")
                except httpx.ConnectError:
                    logger.warning(f"Webhook connection error for exam_id {exam_id} (attempt {attempt + 1})")
                except Exception as e:
                    logger.warning(f"Webhook error for exam_id {exam_id} (attempt {attempt + 1}): {e}")
                
                # Wait before retry (exponential backoff)
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # 1s, 2s, 4s
                    await asyncio.sleep(wait_time)
            
            logger.error(f"Failed to send webhook after {max_retries} attempts for exam_id {exam_id}")
            
    except Exception as e:
        logger.error(f"Error sending webhook notification for exam_id {exam_id}: {e}")

def _get_current_timestamp() -> str:
    """Get current timestamp in ISO format"""
    from datetime import datetime
    return datetime.utcnow().isoformat() + "Z" 