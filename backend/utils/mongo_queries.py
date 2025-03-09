import os
import random
from typing import List, Dict, Any, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "geoguesser"

class MongoQueries:
    """Utility class for MongoDB Atlas queries"""
    
    def __init__(self):
        """Initialize MongoDB client and collections"""
        self.client = AsyncIOMotorClient(MONGO_URI)
        self.db = self.client[DB_NAME]
        self.locations = self.db.location
        self.images = self.db.images
        self.games = self.db.games
        self.users = self.db.users
        logger.info("MongoQueries initialized")
    
    async def close(self):
        """Close MongoDB connection"""
        self.client.close()
        logger.info("MongoDB connection closed")
    
    # =========== LOCATION QUERIES =============
    
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
    
    async def get_location_by_id(self, location_id: str) -> Optional[Dict[str, Any]]:
        """Get a single location by its ID"""
        try:
            location = await self.locations.find_one({"_id": ObjectId(location_id)})
            if location:
                location["_id"] = str(location["_id"])
                return location
            return None
        except Exception as e:
            logger.error(f"Error getting location {location_id}: {str(e)}")
            return None
    
    async def get_locations_by_ids(self, location_ids: List[str]) -> List[Dict[str, Any]]:
        """Get multiple locations by their IDs"""
        try:
            object_ids = [ObjectId(id) for id in location_ids]
            cursor = self.locations.find({"_id": {"$in": object_ids}})
            locations = await cursor.to_list(length=len(location_ids))
            
            for loc in locations:
                loc["_id"] = str(loc["_id"])
            
            return locations
        except Exception as e:
            logger.error(f"Error getting locations by IDs: {str(e)}")
            return []
    
    async def search_locations(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search locations by name"""
        try:
            cursor = self.locations.find(
                {"ucla_name": {"$regex": query, "$options": "i"}}
            ).limit(limit)
            
            locations = await cursor.to_list(length=limit)
            for loc in locations:
                loc["_id"] = str(loc["_id"])
            
            return locations
        except Exception as e:
            logger.error(f"Error searching locations: {str(e)}")
            return []
    
    async def increment_location_views(self, location_id: str) -> bool:
        """Increment the view count for a location"""
        try:
            result = await self.locations.update_one(
                {"_id": ObjectId(location_id)},
                {"$inc": {"views": 1}}
            )
            return result.modified_count == 1
        except Exception as e:
            logger.error(f"Error incrementing views for {location_id}: {str(e)}")
            return False
    
    async def update_location_likes(self, location_id: str, liked: bool) -> bool:
        """Update likes/dislikes for a location"""
        try:
            field = "likes" if liked else "dislikes"
            result = await self.locations.update_one(
                {"_id": ObjectId(location_id)},
                {"$inc": {field: 1}}
            )
            return result.modified_count == 1
        except Exception as e:
            logger.error(f"Error updating likes for {location_id}: {str(e)}")
            return False
    
    async def add_location_comment(self, location_id: str, comment: str) -> bool:
        """Add a comment to a location"""
        try:
            result = await self.locations.update_one(
                {"_id": ObjectId(location_id)},
                {"$push": {"comments": comment}}
            )
            return result.modified_count == 1
        except Exception as e:
            logger.error(f"Error adding comment to {location_id}: {str(e)}")
            return False
    
    # =========== IMAGE QUERIES =============
    
    async def get_image_by_filename(self, filename: str) -> Optional[Dict[str, Any]]:
        """Get an image by its filename"""
        try:
            image = await self.images.find_one({"filename": filename})
            if image:
                image["_id"] = str(image["_id"])
            return image
        except Exception as e:
            logger.error(f"Error getting image {filename}: {str(e)}")
            return None
    
    async def get_all_image_filenames(self) -> List[str]:
        """Get all image filenames in the database"""
        try:
            cursor = self.images.find({}, {"filename": 1})
            images = await cursor.to_list(length=100)
            return [img["filename"] for img in images]
        except Exception as e:
            logger.error(f"Error getting image filenames: {str(e)}")
            return []
    
    # =========== GAME QUERIES =============
    
    async def save_game_result(self, 
                              user_id: Optional[str], 
                              email: Optional[str],
                              score: int, 
                              location_ids: List[str],
                              guesses: List[Dict[str, Any]]) -> Optional[str]:
        """Save a game result to the database"""
        try:
            game_data = {
                "user_id": ObjectId(user_id) if user_id else None,
                "email": email,
                "score": score,
                "location_ids": location_ids,
                "guesses": guesses,
                "played_at": datetime.utcnow()
            }
            
            result = await self.games.insert_one(game_data)
            
            # Update user stats if a user is provided
            if user_id:
                await self.users.update_one(
                    {"_id": ObjectId(user_id)},
                    {
                        "$inc": {
                            "total_games": 1,
                            "total_score": score
                        },
                        "$max": {"high_score": score}
                    }
                )
            
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error saving game result: {str(e)}")
            return None
    
    async def get_leaderboard(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get the leaderboard of top scores"""
        try:
            pipeline = [
                {"$sort": {"score": -1}},
                {"$limit": limit},
                {
                    "$lookup": {
                        "from": "users",
                        "localField": "user_id",
                        "foreignField": "_id",
                        "as": "user"
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "score": 1,
                        "email": 1,
                        "played_at": 1,
                        "user_email": {"$arrayElemAt": ["$user.email", 0]},
                        "user_name": {"$arrayElemAt": ["$user.name", 0]}
                    }
                }
            ]
            
            cursor = self.games.aggregate(pipeline)
            leaderboard = await cursor.to_list(length=limit)
            
            # Convert ObjectId to string
            for entry in leaderboard:
                entry["_id"] = str(entry["_id"])
                # Use stored email if user_email is not available
                if not entry.get("user_email") and entry.get("email"):
                    entry["user_email"] = entry["email"]
            
            return leaderboard
        except Exception as e:
            logger.error(f"Error getting leaderboard: {str(e)}")
            return []
    
    async def get_user_games(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all games for a specific user"""
        try:
            cursor = self.games.find({"user_id": ObjectId(user_id)}).sort("played_at", -1)
            games = await cursor.to_list(length=50)  # Limit to last 50 games
            
            for game in games:
                game["_id"] = str(game["_id"])
            
            return games
        except Exception as e:
            logger.error(f"Error getting games for user {user_id}: {str(e)}")
            return []
    
    # =========== SEED GENERATION =============
    
    def get_daily_seed(self) -> int:
        """Generate a consistent seed for the day"""
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Simple string hash
        seed = 0
        for char in today:
            seed = (seed * 31 + ord(char)) & 0xFFFFFFFF
        
        return seed
    
    def get_seeded_random_indices(self, seed: int, count: int, max_val: int) -> List[int]:
        """Generate random indices using a seed"""
        if count > max_val:
            count = max_val
            
        # Set the random seed
        random.seed(seed)
        
        # Generate unique random indices
        indices = random.sample(range(max_val), count)
        
        return indices
    
    async def get_seeded_locations(self, seed: Optional[int] = None, count: int = 5) -> List[Dict[str, Any]]:
        """Get locations using a seed for consistent randomness"""
        try:
            # If no seed provided, use daily seed
            if seed is None:
                seed = self.get_daily_seed()
                
            # Get total number of locations
            total_locations = await self.locations.count_documents({})
            
            # Get random indices
            indices = self.get_seeded_random_indices(seed, count, total_locations)
            
            # Get locations at those indices
            locations = []
            for idx in indices:
                location = await self.locations.find().skip(idx).limit(1).to_list(length=1)
                if location:
                    location = location[0]
                    location["_id"] = str(location["_id"])
                    locations.append(location)
            
            return locations
        except Exception as e:
            logger.error(f"Error getting seeded locations: {str(e)}")
            return []

# Import for datetime
from datetime import datetime

# Create a singleton instance
mongo_queries = MongoQueries()

# Example usage:
"""
# In a FastAPI endpoint:
from utils.mongo_queries import mongo_queries

@app.get("/random-locations")
async def get_random_locations(count: int = 5):
    locations = await mongo_queries.get_random_locations(count)
    return {"locations": locations}
"""