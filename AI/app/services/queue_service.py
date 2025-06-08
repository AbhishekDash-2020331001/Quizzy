import redis
from rq import Queue
from rq.job import Job
import os
import logging
from typing import Optional, Dict, Any


logger = logging.getLogger(__name__)

class QueueService:
    def __init__(self):
        # Redis connection parameters
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", 6379))
        redis_db = int(os.getenv("REDIS_DB", 0))
        redis_password = os.getenv("REDIS_PASSWORD", None)
        
        try:
            # Create Redis connection
            self.redis_conn = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                password=redis_password
            )
            
            # Test connection
            self.redis_conn.ping()
            logger.info(f"Connected to Redis at {redis_host}:{redis_port}")
            
            # Create queues
            self.pdf_queue = Queue('pdf_processing', connection=self.redis_conn)
            self.quiz_queue = Queue('quiz_processing', connection=self.redis_conn)
            
        except redis.ConnectionError as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
        except Exception as e:
            logger.error(f"Error initializing queue service: {e}")
            raise
    
    def enqueue_pdf_processing(self, upload_data: Dict[str, Any]) -> str:
        """
        Enqueue a PDF processing task
        
        Args:
            upload_data: Dictionary containing upload information
                - uploadthing_url: str
                - upload_id: int
                - pdf_name: Optional[str]
                - pdf_id: str
        
        Returns:
            str: Job ID
        """
        try:
            # Import here to avoid circular imports
            from app.services.pdf_processing_worker import process_pdf_upload
            
            job = self.pdf_queue.enqueue(
                process_pdf_upload,
                upload_data,
                job_timeout='30m'  # 30 minutes timeout
            )
            
            logger.info(f"Enqueued PDF processing job {job.id} for upload_id {upload_data.get('upload_id')}")
            return job.id
            
        except Exception as e:
            logger.error(f"Failed to enqueue PDF processing job: {e}")
            raise
    
    def enqueue_quiz_processing(self, quiz_data: Dict[str, Any]) -> str:
        """
        Enqueue a quiz generation task
        
        Args:
            quiz_data: Dictionary containing quiz generation information
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
            str: Job ID
        """
        try:
            # Import here to avoid circular imports
            from app.services.quiz_processing_worker import process_quiz_generation
            
            job = self.quiz_queue.enqueue(
                process_quiz_generation,
                quiz_data,
                job_timeout='30m'  # 30 minutes timeout
            )
            
            logger.info(f"Enqueued quiz processing job {job.id} for exam_id {quiz_data.get('exam_id')}")
            return job.id
            
        except Exception as e:
            logger.error(f"Failed to enqueue quiz processing job: {e}")
            raise
    
    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the status of a job
        
        Args:
            job_id: The job ID
            
        Returns:
            Dict containing job status information or None if job not found
        """
        try:
            job = Job.fetch(job_id, connection=self.redis_conn)
            
            status_info = {
                "job_id": job.id,
                "status": job.get_status(),
                "created_at": job.created_at.isoformat() if job.created_at else None,
                "started_at": job.started_at.isoformat() if job.started_at else None,
                "ended_at": job.ended_at.isoformat() if job.ended_at else None,
                "result": job.result,
                "meta": job.meta
            }
            
            if job.exc_info:
                status_info["error"] = job.exc_info
                
            return status_info
            
        except Exception as e:
            logger.error(f"Failed to get job status for {job_id}: {e}")
            return None
    
    def get_queue_info(self) -> Dict[str, Any]:
        """
        Get information about the queue
        
        Returns:
            Dict containing queue information
        """
        try:
            return {
                "pdf_queue": {
                    "name": self.pdf_queue.name,
                    "length": len(self.pdf_queue),
                    "pending_jobs": len(self.pdf_queue),
                    "failed_jobs": len(self.pdf_queue.failed_job_registry),
                    "started_jobs": len(self.pdf_queue.started_job_registry),
                    "finished_jobs": len(self.pdf_queue.finished_job_registry)
                },
                "quiz_queue": {
                    "name": self.quiz_queue.name,
                    "length": len(self.quiz_queue),
                    "pending_jobs": len(self.quiz_queue),
                    "failed_jobs": len(self.quiz_queue.failed_job_registry),
                    "started_jobs": len(self.quiz_queue.started_job_registry),
                    "finished_jobs": len(self.quiz_queue.finished_job_registry)
                }
            }
        except Exception as e:
            logger.error(f"Failed to get queue info: {e}")
            return {"error": str(e)}
    
    def cancel_job(self, job_id: str) -> bool:
        """
        Cancel a job if it's still pending
        
        Args:
            job_id: The job ID
            
        Returns:
            bool: True if cancelled successfully, False otherwise
        """
        try:
            job = Job.fetch(job_id, connection=self.redis_conn)
            if job.get_status() == 'queued':
                job.cancel()
                logger.info(f"Cancelled job {job_id}")
                return True
            else:
                logger.warning(f"Cannot cancel job {job_id} - status: {job.get_status()}")
                return False
        except Exception as e:
            logger.error(f"Failed to cancel job {job_id}: {e}")
            return False 