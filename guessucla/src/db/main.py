from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    'https://localhost:3000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
)

class UserBase(BaseModel):
    user_id: int
    username: str
    password: str
    email: str
    friends: str
    profile_pic: str

class ProfileBase(BaseModel):
    profile_id: int
    timestamp: str
    game_history: str
    score: str
    user_id: int


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

models.Base.metadata.create_all(bind=engine)

db_dependency = Annotated[Session, Depends(get_db)]

@app.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserBase, db: db_dependency):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()


@app.post("/profile", status_code=status.HTTP_201_CREATED)
async def create_profile(profile: ProfileBase, db: db_dependency):
    db_profile = models.Profile(**profile.dict())
    db.add(db_profile)
    db.commit()

@app.get("/users/{user_id}", status_code=status.HTTP_200_OK)
async def read_user(user_id: int, db: db_dependency):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    return user

@app.get("/profile/{profile_id}", status_code=status.HTTP_200_OK)
async def read_post(profile_id: int, db: db_dependency):
    profile = db.query(models.Profile).filter(models.Profile.profile_id == profile_id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail='Post was not found')
    return profile