from sqlalchemy import Column, String, Integer, ForeignKey
from database import Base


class User(Base):
    __tablename__ = 'user'

    user_id = Column(String(36), primary_key=True, index=True)
    username = Column(String(50), unique=True)
    password = Column(String(255), nullable=False)
    email = Column(String(50), unique=True, index=True, nullable=False)
    friends = Column(String(50))
    profile_pic = Column(String(50))

class Profile(Base):
    __tablename__ = "profile"  # Rename the table to "profile"

    profile_id = Column(
        String(36), primary_key=True, index=True
    )  # UUIDs are 36 characters long
    timestamp = Column(String(255), nullable=False)
    game_history = Column(String(255), index=True, nullable=False)
    score = Column(String(255), nullable=False)
    user_id = Column(String, ForeignKey("user.user_id"), unique=True, nullable=False)