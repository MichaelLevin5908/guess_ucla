// Create a new collection 'images' in MongoDB Atlas

// Load environment variables from the .env file
require("dotenv").config();

const { MongoClient, Binary } = require("mongodb");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Get the MongoDB connection string from environment variables
const url = process.env.MONGO_URI; // from .env
const client = new MongoClient(url);

async function storeMultipleImages() {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db("geoguesser"); // database: 'geoguesser'

    // Create 'images' collection
    const collection = db.collection("images");

    // Array of image filenames
    const imagePaths = [
      path.join(
        os.homedir(),
        "Desktop",
        "mongodb-practice",
        "mongodb-with-fastapi",
        "mongo-images",
        "boelter-hall.jpg",
      ),
      path.join(
        os.homedir(),
        "Desktop",
        "mongodb-practice",
        "mongodb-with-fastapi",
        "mongo-images",
        "bruin-statue.jpg",
      ),
      path.join(
        os.homedir(),
        "Desktop",
        "mongodb-practice",
        "mongodb-with-fastapi",
        "mongo-images",
        "fowler-museum.jpg",
      ),
      path.join(
        os.homedir(),
        "Desktop",
        "mongodb-practice",
        "mongodb-with-fastapi",
        "mongo-images",
        "powell-library.jpg",
      ),
      path.join(
        os.homedir(),
        "Desktop",
        "mongodb-practice",
        "mongodb-with-fastapi",
        "mongo-images",
        "royce-hall.jpg",
      ),
      path.join(
        os.homedir(),
        "Desktop",
        "mongodb-practice",
        "mongodb-with-fastapi",
        "mongo-images",
        "sculpture-garden.jpg",
      ),
    ];

    const images = imagePaths
      .map((imagePath) => {
        try {
          const imageBuffer = fs.readFileSync(imagePath);
          const filename = path.basename(imagePath);

          return {
            filename: filename,
            image: new Binary(imageBuffer), // Store image as Binary
          };
        } catch (err) {
          console.error(`Error reading image at ${imagePath}:`, err);
          return null; // Return null for any errors reading the image
        }
      })
      .filter((image) => image !== null); // Filter out failed images

    if (images.length > 0) {
      // Insert multiple images into MongoDB's 'images' collection
      const result = await collection.insertMany(images);
      console.log(
        'Images stored successfully in "images" collection!',
        result.insertedCount,
      );
    } else {
      console.log("No images to store due to errors.");
    }
  } catch (error) {
    console.error("Error storing images:", error);
  } finally {
    await client.close();
  }
}

storeMultipleImages();
