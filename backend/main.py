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
    return {"user_id": user_id, "profile_id": profile_id}


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


@app.get("/profile", response_model=schemas.ProfileResponse)
async def read_profile(
    current_profile: models.Profile = Depends(auth.get_current_user),
):
    if not current_profile:
        raise HTTPException(status_code=401, detail="Not Authenticated")
    return current_profile


@app.put("/profile", response_model=schemas.ProfileResponse)
async def update_profile(
    profile: schemas.ProfileUpdate,
    current_profile: models.Profile = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_profile:
        raise HTTPException(status_code=401, detail="Not Authenticated")
    current_profile.average_score = profile.average_score
    await db.commit()
    await db.refresh(current_profile)
    return current_profile


@app.delete("/profile")
async def delete_profile(
    current_profile: models.Profile = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_profile:
        raise HTTPException(status_code=401, detail="Not Authenticated")
    game_history = await db.execute(
        select(models.GameHistory).where(
            models.GameHistory.profile_id == current_profile.profile_id
        )
    )
    profile = await db.execute(
        select(models.Profile).where(
            models.Profile.profile_id == current_profile.profile_id
        )
    )
    user = await db.execute(
        select(models.User).where(models.User.user_id == current_profile.user_id)
    )
    if game_history.scalar_one_or_none() is not None:
        await db.delete(game_history.scalar())
    await db.delete(profile.scalar())
    await db.delete(user.scalar())
    await db.commit()
    return {"message": "Profile deleted"}


@app.put("/game", response_model=schemas.GameResponse)
async def update_game(
    lobby_id: str,
    seed: int,
    score1: int,
    score2: int,
    score3: int,
    score4: int,
    score5: int,
    timestamp: int,
    current_profile: models.Profile = Depends(auth.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_profile:
        raise HTTPException(status_code=401, detail="Not Authenticated")
    game_id = str(uuid.uuid4())
    game = models.Game(
        game_id=game_id,
        lobby_id=lobby_id,
        seed=seed,
        timestamp=timestamp,
        score1=score1,
        score2=score2,
        score3=score3,
        score4=score4,
        score5=score5,
        profile_id=current_profile.profile_id,
    )
    db.add(game)
    await db.commit()
    await db.refresh(game)
    return game


@app.get("/game/lobby_id", response_model=list[schemas.GameResponse])
async def get_game(
    lobby_id: str,
    db: AsyncSession = Depends(get_db),
):
    game = await db.execute(select(models.Game).where(models.Game.lobby_id == lobby_id))
    games = game.scalars().all()
    return list(games)


@app.get("/game/profile_id", response_model=list[schemas.GameResponse])
async def get_game(
    profile_id: str,
    db: AsyncSession = Depends(get_db),
):
    game = await db.execute(
        select(models.Game).where(models.Game.profile_id == profile_id)
    )
    games = game.scalars().all()
    return list(games)


@app.get("/game/profile_and_lobby_id", response_model=list[schemas.GameResponse])
async def get_game(
    profile_id: str,
    lobby_id: str,
    db: AsyncSession = Depends(get_db),
):
    game = await db.execute(
        select(models.Game).where(models.Game.profile_id == profile_id)
    )
    game = await db.execute(select(models.Game).where(models.Game.lobby_id == lobby_id))
    games = game.scalars().all()
    return list(games)
