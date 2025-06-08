#!/usr/bin/env python3
"""
Redis Queue Worker for PDF Processing

This script runs a worker that processes PDF upload jobs from the Redis queue.
Run this script in a separate process to handle PDF processing in the background.

Usage:
    python worker.py [--burst] [--name WORKER_NAME]

Options:
    --burst: Run in burst mode (exit when queue is empty)
    --name: Set a custom worker name
"""

import sys
import os
import logging
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

import redis
from rq import Queue, Worker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

def create_redis_connection():
    """Create Redis connection using environment variables"""
    redis_host = os.getenv("REDIS_HOST", "redis")  # Default to 'redis' for Docker
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    redis_db = int(os.getenv("REDIS_DB", 0))
    redis_password = os.getenv("REDIS_PASSWORD", None)
    
    return redis.Redis(
        host=redis_host,
        port=redis_port,
        db=redis_db,
        password=redis_password
    )

def main():
    """Main worker function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="PDF and Quiz Processing Worker")
    parser.add_argument(
        "--burst", 
        action="store_true", 
        help="Run in burst mode (exit when queue is empty)"
    )
    parser.add_argument(
        "--name", 
        type=str, 
        default=None, 
        help="Set a custom worker name"
    )
    parser.add_argument(
        "--queue", 
        type=str, 
        default="both", 
        help="Queue name to process (default: both) - options: pdf_processing, quiz_processing, both"
    )
    
    args = parser.parse_args()
    
    try:
        # Create Redis connection
        redis_conn = create_redis_connection()
        
        # Test connection
        redis_conn.ping()
        logger.info("Connected to Redis successfully")
        
        # Create queues
        queues = []
        if args.queue == "both":
            queues = [
                Queue('pdf_processing', connection=redis_conn),
                Queue('quiz_processing', connection=redis_conn)
            ]
            queue_names = "pdf_processing, quiz_processing"
        elif args.queue == "pdf_processing":
            queues = [Queue('pdf_processing', connection=redis_conn)]
            queue_names = "pdf_processing"
        elif args.queue == "quiz_processing":
            queues = [Queue('quiz_processing', connection=redis_conn)]
            queue_names = "quiz_processing"
        else:
            raise ValueError(f"Invalid queue name: {args.queue}. Must be 'pdf_processing', 'quiz_processing', or 'both'")
        
        # Create worker
        worker_name = args.name or f"worker-{os.getpid()}"
        worker = Worker(queues, connection=redis_conn, name=worker_name)
        
        logger.info(f"Starting worker '{worker_name}' for queues: {queue_names}")
        if args.burst:
            logger.info("Running in burst mode")
        
        # Start worker
        worker.work(burst=args.burst)
        
    except redis.ConnectionError as e:
        logger.error(f"Failed to connect to Redis: {e}")
        logger.error("Make sure Redis is running and check your Redis configuration")
        sys.exit(1)
    except KeyboardInterrupt:
        logger.info("Worker interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Error starting worker: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 