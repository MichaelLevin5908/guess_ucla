from sqlalchemy import Boolean, Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True)
    password = Column(String(50))
    email = Column(String(50))
    friends = Column(String(100))
    profile_pic = Column(String(50))


class Profile(Base):
    __tablename__ = 'profile'

    profile_id = Column(Integer, primary_key=True, index=True)
    timestamp_updated = Column(String(50))
    game_history = Column(String(350))
    score = Column(String(350))
    user_id = Column(Integer)