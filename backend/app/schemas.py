from pydantic import BaseModel
import datetime
from typing import Optional,List,Literal 
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    teacher: bool

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime.datetime
    deleted_at: datetime.datetime | None = None # deleted_at can be None if the user has not deleted their account
    teacher: bool
    credits: float
    
    class Config:
        from_attributes = True 

class requestdetails(BaseModel):
    email:str
    password:str
        
class TokenSchema(BaseModel):
    message: str
    access_token: str
    refresh_token: str


class TokenCreate(BaseModel):
    user_id:str
    access_token:str
    refresh_token:str
    status:bool
    created_date:datetime.datetime

class changepassword(BaseModel):
    email:str
    old_password:str
    new_password:str


# ----- Exam Schemas -----
class ExamCreate(BaseModel):
    name: str
    retake: Optional[bool] = False
    start_time: datetime.datetime
    end_time: datetime.datetime
    quiz_type: Literal["topic", "page_range"]
    upload_ids: List[int]
    topic: Optional[str] = None
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    quiz_difficulty: Optional[str] = None
    questions_count: int

class ExamResponse(BaseModel):
    id: int
    user_id: int
    name: str
    retake: bool
    uploads: List['UploadResponse']
    start_time: datetime.datetime
    end_time: datetime.datetime
    quiz_type: Literal["topic", "page_range"]
    topic: Optional[str] = None
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    processing_state: int
    created_at: datetime.datetime
    deleted_at: Optional[datetime.datetime] = None
    questions_count: int
    participants_count: int
    quiz_difficulty: Optional[str] = None

    class Config:
        from_attributes = True

class ExamPublicResponse(BaseModel):
    id: int
    name: str
    retake: bool
    start_time: datetime.datetime
    end_time: datetime.datetime

    class Config:
        from_attributes = True

class ExamDetailResponse(BaseModel):
    id: int
    user_id: int
    name: str
    retake: bool
    uploads: List['UploadResponse']
    questions: List['QuestionResponse']
    start_time: datetime.datetime
    end_time: datetime.datetime
    quiz_type: Literal["topic", "page_range"]
    topic: Optional[str] = None
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    processing_state: int
    created_at: datetime.datetime
    deleted_at: Optional[datetime.datetime] = None
    questions_count: int
    participants_count: int
    quiz_difficulty: Optional[str] = None

    class Config:
        from_attributes = True


class ExamInfoResponse(BaseModel):
    id: int
    name: str
    start_time: datetime.datetime
    end_time: datetime.datetime
    quiz_type: Literal["topic", "page_range"]
    topic: Optional[str] = None
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    quiz_difficulty: Optional[str] = None
    questions_count: int
    retake: bool

    class Config:
        from_attributes = True

class ExamUpdate(BaseModel):
    name: Optional[str] = None
    retake: Optional[bool] = None
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None
    quiz_type: Optional[Literal["topic", "page_range"]] = None
    topic: Optional[str] = None
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    quiz_difficulty: Optional[str] = None
    questions_count: Optional[int] = None
    questions: Optional[List[QuestionEditData]] = None

# ----- Uploads Schemas -----
class UploadCreate(BaseModel):
    url: str
    pdf_name: str

class UploadUpdate(BaseModel):
    url: Optional[str] = None

class UploadProcessingCallback(BaseModel):
    pdf_id: str
    total_pages: int

class UploadResponse(BaseModel):
    id: int
    user_id: int
    url: str
    processing_state: int
    pdf_id: Optional[str] = None
    pages: Optional[int] = None
    pdf_name: Optional[str] = None
    created_at: datetime.datetime
    deleted_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True


# ----- Question Schemas -----
class QuestionCreate(BaseModel):
    text: str
    option_1: Optional[str]
    option_2: Optional[str]
    option_3: Optional[str]
    option_4: Optional[str]
    correct_answer: Literal['1', '2', '3', '4']
    explanation: Optional[str]

class QuestionsCreateRequest(BaseModel):
    exam_id: int
    questions: List[QuestionCreate]

class QuestionUpdate(BaseModel):
    text: Optional[str] = None
    option_1: Optional[str] = None
    option_2: Optional[str] = None
    option_3: Optional[str] = None
    option_4: Optional[str] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None

class QuestionEditData(BaseModel):
    id: Optional[int] = None  # None for new questions, actual ID for existing questions
    text: str
    option_1: str
    option_2: str
    option_3: str
    option_4: str
    correct_answer: Literal['1', '2', '3', '4']
    explanation: str

class QuestionResponse(BaseModel):
    id: int
    exam_id: int
    text: str
    option_1: str
    option_2: str
    option_3: str
    option_4: str
    correct_answer: str
    explanation: str
    created_at: datetime.datetime
    deleted_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class QuestionPublicResponse(BaseModel):
    id: int
    exam_id: int
    text: str
    option_1: str
    option_2: str
    option_3: str
    option_4: str
    created_at: datetime.datetime
    deleted_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# ----- Takes Schemas -----
class TakeCreate(BaseModel):
    device_id: str


class TakeUpdate(BaseModel):
    correct_answers: Optional[int] = None

class TakeResponse(BaseModel):
    id: int
    exam_id: int
    user_id: int
    correct_answers: Optional[int]
    created_at: datetime.datetime
    deleted_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class TakeExamResponse(BaseModel):
    message: str
    takes_id: int
    exam_id: int
    exam: ExamInfoResponse
    questions: List[QuestionPublicResponse]

    class Config:
        from_attributes = True


# ----- Answers Schemas -----
class AnswerCreate(BaseModel):
    question_id: int
    takes_id: int
    answer: str

class AnswerUpdate(BaseModel):
    answer: Optional[str] = None

class AnswerResponse(BaseModel):
    id: int
    question_id: int
    takes_id: int
    answer: str
    created_at: datetime.datetime
    deleted_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class BulkAnswerItem(BaseModel):
    question_id: int
    answer: Literal['1', '2', '3', '4']

class BulkAnswerCreate(BaseModel):
    takes_id: int
    answers: List[BulkAnswerItem]

class BulkAnswerResponse(BaseModel):
    correct_answers: int

class RankingResponse(BaseModel):
    id: int
    username: str
    correct_answers: int

    class Config:
        from_attributes = True



class GeneratedQuestion(BaseModel):
    question: str
    options: List[str]  # Array of 4 options
    correct_answer: str  # The correct option text
    explanation: str

class QuizGenerationCallback(BaseModel):
    quiz_id: str
    questions: List[GeneratedQuestion]

class UserTakeDetail(BaseModel):
    id: int
    quiz_name: str
    quiz_difficulty: Optional[str]
    quiz_type: str
    quiz_created_at: datetime.datetime
    correct_answers: Optional[int]
    ranking: int
    total_participants: int
    total_questions: int
    start_time: datetime.datetime
    end_time: datetime.datetime

    class Config:
        from_attributes = True


class QuestionDetailWithAnswer(BaseModel):
    id: int
    text: str
    option_1: str
    option_2: str
    option_3: str
    option_4: str
    correct_answer: str
    explanation: str
    user_answer: Optional[str] = None
    is_correct: bool

    class Config:
        from_attributes = True

class ExamDetailForTake(BaseModel):
    id: int
    name: str
    quiz_difficulty: Optional[str]
    quiz_type: str
    topic: Optional[str] = None
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    questions_count: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class DetailedTakeResponse(BaseModel):
    take_id: int
    exam: ExamDetailForTake
    user_id: int
    correct_answers: int
    total_questions: int
    score_percentage: float
    ranking: int
    total_participants: int
    questions: List[QuestionDetailWithAnswer]
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ----- Dashboard Schemas -----
class DashboardResponse(BaseModel):
    total_pdf: int
    total_quiz: int
    total_exam_participated: int
    credits: int
    recent_pdfs: List[UploadResponse]
    recent_quizzes: List[ExamResponse]

    class Config:
        from_attributes = True


class UserDashboardResponse(BaseModel):
    total_exams: int
    avg_score: float
    best_score: float
    takes: List[UserTakeDetail]

    class Config:
        from_attributes = True

class ParticipantAnalytics(BaseModel):
    user_id: int
    username: str
    correct_answers: int
    total_questions: int
    score_percentage: float
    ranking: int
    time_taken: Optional[str] = None
    completed_at: datetime.datetime

    class Config:
        from_attributes = True

class QuestionAnalytics(BaseModel):
    question_id: int
    question_text: str
    total_attempts: int
    correct_attempts: int
    success_rate: float
    option_1_count: int
    option_2_count: int
    option_3_count: int
    option_4_count: int
    correct_option: str

    class Config:
        from_attributes = True

class ScoreDistribution(BaseModel):
    score_range: str  # e.g., "0-20", "21-40", etc.
    count: int
    percentage: float

class ExamAnalyticsResponse(BaseModel):
    exam_id: int
    exam_name: str
    exam_creator: str
    quiz_type: str
    quiz_difficulty: Optional[str]
    topic: Optional[str] = None
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    questions_count: int
    created_at: datetime.datetime
    start_time: datetime.datetime
    end_time: datetime.datetime
    
    # Participation Statistics
    total_participants: int
    total_completed: int
    completion_rate: float
    
    # Score Statistics
    average_score: float
    median_score: float
    highest_score: float
    lowest_score: float
    std_deviation: float
    
    # Detailed Data
    participants: List[ParticipantAnalytics]
    question_analytics: List[QuestionAnalytics]
    score_distribution: List[ScoreDistribution]
    
    # Time-based Analytics
    daily_participants: List[dict]  # {"date": "2024-01-15", "count": 5}
    
    class Config:
        from_attributes = True


class SubjectPerformance(BaseModel):
    subject: str
    exams_taken: int
    average_score: float
    best_score: float
    worst_score: float
    improvement_trend: str  # "improving", "declining", "stable"

class DifficultyPerformance(BaseModel):
    difficulty: str
    exams_taken: int
    average_score: float
    success_rate: float

class PerformanceTrend(BaseModel):
    date: str
    score: float
    exam_name: str
    exam_id: int

class ComparisonStats(BaseModel):
    user_average: float
    global_average: float
    percentile_rank: float
    better_than_percentage: float

class StrengthWeakness(BaseModel):
    category: str  # "strength" or "weakness"
    subject: str
    average_score: float
    exams_count: int
    description: str

class ActivitySummary(BaseModel):
    total_exams_taken: int
    total_questions_answered: int
    total_correct_answers: int
    overall_accuracy: float
    active_days: int
    streak_current: int
    streak_longest: int

class UserOverallAnalyticsResponse(BaseModel):
    user_id: int
    username: str
    
    # Overall Performance
    activity_summary: ActivitySummary
    overall_average_score: float
    
    # Performance by Categories
    subject_performance: List[SubjectPerformance]
    difficulty_performance: List[DifficultyPerformance]
    
    # Trends and Progress
    performance_trends: List[PerformanceTrend]
    monthly_progress: List[dict]  # {"month": "2024-01", "average_score": 75.5, "exams_count": 5}
    
    # Comparative Analytics
    comparison_stats: ComparisonStats
    
    # Insights
    strengths_weaknesses: List[StrengthWeakness]
    
    # Recent Activity
    recent_exams: List[UserTakeDetail]
    
    class Config:
        from_attributes = True

# ----- Payment Schemas -----
class PaymentIntentCreate(BaseModel):
    amount: float  # Amount in dollars
    currency: str = "usd"

class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: float
    credits_to_purchase: float

class PaymentWebhookData(BaseModel):
    payment_intent_id: str
    status: str
    amount_received: Optional[float] = None

class PaymentResponse(BaseModel):
    id: int
    user_id: int
    stripe_payment_intent_id: str
    amount: float
    credits_purchased: float
    status: str
    created_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class CreditBalance(BaseModel):
    credits: float
    
class InsufficientCreditsError(BaseModel):
    detail: str
    required_credits: float
    available_credits: float