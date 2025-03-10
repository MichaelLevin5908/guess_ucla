from sqlalchemy import Column, String, Integer, Float
from database import Base
from sqlalchemy import ForeignKey


class User(Base):
    __tablename__ = "user"

    user_id = Column(String(36), primary_key=True, unique=True, index=True)
    username = Column(String(50))
    password = Column(String(255), nullable=False)
    email = Column(String(50), unique=True, index=True, nullable=False)


class Profile(Base):
    __tablename__ = "profile"
    
    profile_id = Column(
        String(36), primary_key=True, unique=True, index=True
    )  # UUIDs are 36 characters long
    average_score = Column(Float, nullable=False)
    user_id = Column(
        String(36), ForeignKey("user.user_id"), unique=True, nullable=False, index=True
    )


class Game(Base):
    __tablename__ = "game"

    game_id = Column(String(36), primary_key=True, unique=True, index=True)
    lobby_id = Column(String(36), unique=False, index=True)
    seed = Column(Integer, unique=False, nullable=False)
    timestamp = Column(Integer, nullable=False)
    score1 = Column(Integer, nullable=False)
    score2 = Column(Integer, nullable=False)
    score3 = Column(Integer, nullable=False)
    score4 = Column(Integer, nullable=False)
    score5 = Column(Integer, nullable=False)
    profile_id = Column(
        String(36), ForeignKey("profile.profile_id"), unique=False, nullable=False, index=True,
    )
    