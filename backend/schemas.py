from pydantic import BaseModel, EmailStr
from typing import Optional, List


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


class ProfileUpdate(BaseModel):
    average_score: float


class GameResponse(BaseModel):
    game_id: str
    lobby_id: str
    seed: int
    timestamp: int
    score1: int
    score2: int
    score3: int
    score4: int
    score5: int
    profile_id: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
