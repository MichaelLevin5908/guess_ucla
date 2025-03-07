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


class GameHistory(Base):
    __tablename__ = "game_history"

    game_history_id = Column(String(36), primary_key=True, unique=True, index=True)
    profile_id = Column(
        String(36), ForeignKey("profile.profile_id"), unique=True, nullable=False, index=True
    )
    game_info = Column(String(36), nullable=True)
    score = Column(Float, nullable=True)