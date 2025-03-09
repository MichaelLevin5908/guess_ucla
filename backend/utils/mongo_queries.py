from typing import List, Dict, Any, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging
import os
import random
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "guessucla"


class MongoQueries:
    """Utility class for MongoDB Atlas queries"""

    def __init__(self):
        """Initialize MongoDB client and collections"""
        try:
            self.client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            # Test connection
            self.client.admin.command("ping")
            self.db = self.client[DB_NAME]
            self.locations = self.db.location
            self.images = self.db.images
            self.games = self.db.games
            self.users = self.db.users
            logger.info("MongoQueries initialized successfully")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            # Don't crash the app, but log the error
            self.client = None
            self.db = None

    async def get_random_locations(self, count: int = 5) -> List[Dict[str, Any]]:
        """Get random locations for the game"""
        try:
            # Using aggregation pipeline with $sample for random sampling
            pipeline = [{"$sample": {"size": count}}]
            cursor = self.locations.aggregate(pipeline)
            locations = await cursor.to_list(length=count)

            # Convert ObjectId to string for JSON serialization
            for loc in locations:
                loc["_id"] = str(loc["_id"])

            logger.info(f"Retrieved {len(locations)} random locations")
            return locations
        except Exception as e:
            logger.error(f"Error getting random locations: {str(e)}")
            return []


# Create a singleton instance
mongo_queries = MongoQueries()