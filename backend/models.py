from sqlalchemy import Column, String, Integer
from database import Base

class Profile(Base):
    __tablename__ = "profile"  # Rename the table to "profile"

    user_id = Column(String(36), primary_key=True, index=True)  # UUIDs are 36 characters long
    name = Column(String(255), nullable=False) 
    email = Column(String(255), unique=True, index=True, nullable=False) 
    password = Column(String(255), nullable=False) 