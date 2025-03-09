import os
from typing import Optional, List

from fastapi import FastAPI, Body, HTTPException, status
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ConfigDict, BaseModel, Field
from pydantic.functional_validators import BeforeValidator

from typing_extensions import Annotated

from bson import ObjectId
import motor.motor_asyncio
from pymongo import ReturnDocument

from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

geo_db = FastAPI()

geo_db.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allow all headers
)

# MongoDB URI from environment variables
MONGO_URI = os.getenv("MONGO_URI")  # from .env

# Motor's async MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)

# Database `geoguesser`
db = client.get_database("geoguesser")
# Collection `location`
location_collection = db.get_collection("location")

# Represents an ObjectId field in the database.
# It will be represented as a `str` on the model so that it can be serialized to JSON.
PyObjectId = Annotated[str, BeforeValidator(str)]


class LocationModel(BaseModel):
    """
    Container for a single location record.
    """

    # The primary key for the LocationModel, stored as a `str` on the instance.
    # This will be aliased to `_id` when sent to MongoDB,
    # but provided as `id` in the API requests and responses.
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    ucla_name: str = Field(...)  # name of the location from Google Maps
    address: str = Field(...)  # from Google Maps
    coordinates: str = Field(...)  # from Google Maps
    image_storage: str = Field(...)  # MongoDB Atlas
    views: Optional[int] = Field(
        default=0
    )  # how many times the image was being guessed
    ranking: Optional[int] = Field(default=1000)  # based on how easy to guess
    likes: Optional[int] = Field(default=0)  # how many likes the location has
    dislikes: Optional[int] = Field(default=0)  # how many dislikes the location has
    comments: List[str] = Field(default=[])  # list of user comments

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "ucla_name": "Royce Hall",
                "address": "10745 Dickson Ct, Los Angeles, CA 90095",
                "coordinates": "lat: 34.07296, lon: -118.44219",
                "image_storage": "/9j/4AAQSkZJRgABAQAA...",
                "views": 500,
                "ranking": 346,
                "likes": 120,
                "dislikes": 11,
                "comments": ["Iconic", "Easy to guess"],
            }
        },
    )


class UpdateLocationModel(BaseModel):
    """
    A set of optional updates to be made to a document in the database.
    """

    ucla_name: Optional[str] = None
    address: Optional[str] = None
    coordinates: Optional[str] = None
    image_storage: Optional[str] = None
    views: Optional[int] = None
    ranking: Optional[int] = None
    likes: Optional[int] = None
    dislikes: Optional[int] = None
    comments: List[str] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "ucla_name": "Royce Hall",
                "address": "10745 Dickson Ct, Los Angeles, CA 90095",
                "coordinates": "lat: 34.07296, lon: -118.44219",
                "image_storage": "/9j/4AAQSkZJRgABAQAA...",
                "views": 500,
                "ranking": 346,
                "likes": 120,
                "dislikes": 11,
                "comments": ["Iconic", "Easy to guess"],
            }
        },
    )


class LocationCollection(BaseModel):
    """
    A container holding a list of `LocationModel` instances.

    This exists because providing a top-level array in a JSON response can be a
    [vulnerability](https://haacked.com/archive/2009/06/25/json-hijacking.aspx/)
    """

    locations: List[LocationModel]


# The application has five routes:
#   POST/locations/ - creates a new location
#   GET/locations/ - view a list of all locations
#   GET/locations/{id} - view a single location
#   PUT/locations/{id} - update a location
#   DELETE/locations/{id} - delete a location
@geo_db.post(
    "/locations/",
    response_description="Add new location",
    response_model=LocationModel,
    status_code=status.HTTP_201_CREATED,
    response_model_by_alias=False,
)
async def create_location(location: LocationModel = Body(...)):
    """
    Insert a new location record.

    A unique `id` will be created and provided in the response.
    """
    new_location = await location_collection.insert_one(
        location.model_dump(by_alias=True, exclude=["id"])
    )
    created_location = await location_collection.find_one(
        {"_id": new_location.inserted_id}
    )
    return created_location


@geo_db.get(
    "/locations/",
    response_description="List all locations",
    response_model=LocationCollection,
    response_model_by_alias=False,
)
async def list_locations():
    """
    List all of the location data in the database.

    The response is unpaginated and limited to 1000 results.
    """
    return LocationCollection(locations=await location_collection.find().to_list(1000))


@geo_db.get(
    "/locations/{id}",
    response_description="Get a single location",
    response_model=LocationModel,
    response_model_by_alias=False,
)
async def show_location(id: str):
    """
    Get the record for a specific location, looked up by `id`.
    """
    if (
        location := await location_collection.find_one({"_id": ObjectId(id)})
    ) is not None:
        return location

    raise HTTPException(status_code=404, detail=f"Location {id} not found")


@geo_db.put(
    "/locations/{id}",
    response_description="Update a location",
    response_model=LocationModel,
    response_model_by_alias=False,
)
async def update_location(id: str, location: UpdateLocationModel = Body(...)):
    """
    Update individual fields of an existing location record.

    Only the provided fields will be updated.
    Any missing or `null` fields will be ignored.
    """
    location = {
        k: v for k, v in location.model_dump(by_alias=True).items() if v is not None
    }

    if len(location) >= 1:
        update_result = await location_collection.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": location},
            return_document=ReturnDocument.AFTER,
        )
        if update_result is not None:
            return update_result
        else:
            raise HTTPException(status_code=404, detail=f"Location {id} not found")

    # The update is empty, but we should still return the matching document:
    if (
        existing_location := await location_collection.find_one({"_id": id})
    ) is not None:
        return existing_location

    raise HTTPException(status_code=404, detail=f"Location {id} not found")


@geo_db.delete("/locations/{id}", response_description="Delete a location")
async def delete_location(id: str):
    """
    Remove a single location record from the database.
    """
    delete_result = await location_collection.delete_one({"_id": ObjectId(id)})

    if delete_result.deleted_count == 1:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail=f"Location {id} not found")
