from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
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
    user_id = str(uuid.uuid4())
    profile_id = str(uuid.uuid4())
    game_history_id = str(uuid.uuid4())

    # Hash the password
    hashed_password = auth.get_password_hash(profile.password)

    db_user = models.User(
        user_id=user_id,
        username=profile.name,
        email=profile.email,
        password=hashed_password,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    db_profile = models.Profile(
        user_id=user_id, profile_id=profile_id, average_score=0.0
    )
    db.add(db_profile)
    await db.commit()
    await db.refresh(db_profile)
    db_game_history = models.GameHistory(
        game_history_id=game_history_id,
        profile_id=profile_id,
    )
    db.add(db_game_history)
    await db.commit()
    await db.refresh(db_game_history)
    return {"user_id": user_id, "profile_id": profile_id, "email": profile.email}


@app.post("/login", response_model=schemas.Token)
async def login(profile: schemas.ProfileLogin, db: AsyncSession = Depends(get_db)):
    db_user = await db.execute(
        select(models.User).where(models.User.email == profile.email)
    )
    db_user = db_user.scalar_one_or_none()
    if not db_user or not auth.verify_password(profile.password, db_user.password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me", response_model=schemas.ProfileResponse)
async def read_profile(
    current_profile: models.Profile = Depends(auth.get_current_user),
):
    return current_profile


@app.put("/profile", response_model=schemas.ProfileResponse)
async def update_profile(
    profile: schemas.ProfileUpdate,
    current_profile: models.Profile = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_profile.average_score = profile.average_score
    await db.commit()
    await db.refresh(current_profile)
    return current_profile


@app.put("/profile/game")
async def update_game_history(
    game_info: str,
    score: float,
    current_profile: models.Profile = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    db_game_history = await db.execute(
        select(models.GameHistory).where(
            models.GameHistory.profile_id == current_profile.profile_id
        )
    )
    if not db_game_history:
        raise HTTPException(status_code=404, detail="Profile not found")

    db_game_history = db_game_history.scalar_one_or_none()
    db_game_history.game_info = game_info
    db_game_history.score = score
    db.add(db_game_history)
    await db.commit()
    await db.refresh(db_game_history)
    return db_game_history
