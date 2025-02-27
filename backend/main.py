from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from pydantic import BaseModel
import models
import schemas
import auth
from database import engine, get_db
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProfileBase(BaseModel):
    profile_id: str
    timestamp: str
    game_history: str
    score: str
    user_id: int

class UserBase(BaseModel):
    user_id: int
    username: str
    password: str
    email: str
    friends: str
    profile_pic: str


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)


@app.post("/register", response_model=schemas.ProfileResponse)
async def register(profile: schemas.ProfileCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    existing_profile = await db.execute(
        select(models.User).where(models.User.email == profile.email)
    )
    if existing_profile.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generate a random user_id
    profile_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())

    # Hash the password
    hashed_password = auth.get_password_hash(profile.password)

    # Create the user
    db_user = models.User(
        user_id=user_id,
        username=profile.username,
        email=profile.email,
        password=hashed_password,
    )

    # Create the profile
    db_profile = models.Profile(
        profile_id=profile_id,
        user_id=user_id,
        timestamp="N/A",
        game_history="",
        score="0"
    )
    db.add_all([db_user, db_profile])
    await db.commit()
    await db.refresh(db_user)
    await db.refresh(db_profile)

    return db_profile



@app.post("/login", response_model=schemas.Token)
async def login(profile: schemas.ProfileLogin, db: AsyncSession = Depends(get_db)):
    db_profile = await db.execute(
        select(models.User).where(models.User.email == profile.email)
    )
    db_profile = db_profile.scalar_one_or_none()
    if not db_profile or not auth.verify_password(
        profile.password, db_profile.password
    ):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = auth.create_access_token(data={"sub": db_profile.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me", response_model=schemas.ProfileResponse)
async def read_profile(
    current_profile: models.Profile = Depends(auth.get_current_user),
):
    return current_profile
