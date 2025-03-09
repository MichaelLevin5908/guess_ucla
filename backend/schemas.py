from pydantic import BaseModel, EmailStr
from typing import Optional


class ProfileCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class ProfileLogin(BaseModel):
    email: str
    password: str


class ProfileResponse(BaseModel):
    user_id: str
    profile_id: str
    email: str


class ProfileUpdate(BaseModel):
    average_score: float


class GameHistoryUpdate(BaseModel):
    game_info: str
    score: float


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
