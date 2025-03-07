require('dotenv').config(); 

const { MongoClient, Binary, ObjectId } = require('mongodb');
const fs = require('fs').promises; // Use promises API
const path = require('path');
const os = require('os');

const url = process.env.MONGO_URI;  // MongoDB URI from .env
const client = new MongoClient(url);

async function updateImageInLocation() {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db('geoguesser');
    const locationCollection = db.collection('location'); // Location collection

    // Path to the new image
    const imagePath = path.join(os.homedir(), 'Desktop', 'mongodb-practice', 'mongodb-with-fastapi', 'mongo-images', 'ucla-store.jpg');

    // Read the image file
    const imageBuffer = await fs.readFile(imagePath);

    // Create Binary object using the image buffer directly
    const binaryImage = new Binary(imageBuffer);

    // Specify the document ID of the location you want to update
    const locationId = '67c7f9878ad55196c9677602';  // document _id

    // Update the document with the correct binary image
    const updateResult = await locationCollection.updateOne(
      { _id: new ObjectId(locationId) },  // Find the location by _id
      { $set: { image_storage: binaryImage } }  // Set the new image storage
    );

    if (updateResult.modifiedCount > 0) {
      console.log('Image updated successfully!');
    } else {
      console.log('No document found or no change made.');
    }
  } catch (error) {
    console.error('Error updating image in the location collection:', error);
  } finally {
    await client.close();
  }
}

updateImageInLocation();
