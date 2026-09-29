from typing import Optional
from pydantic import BaseModel, EmailStr

class VerifyTokenRequest(BaseModel):
    id_token: str

class UserProfile(BaseModel):
    uid: str
    email: str
    name: str
    college: Optional[str] = "Engineering Institute"
    branch: Optional[str] = "Computer Science and Engineering"
    batch: Optional[str] = "2024-2028"
    cgpa: Optional[float] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    batch: Optional[str] = None
    cgpa: Optional[float] = None
