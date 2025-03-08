require('dotenv').config(); 

const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs').promises; // use promises API
const path = require('path');
const os = require('os');

const url = process.env.MONGO_URI;  // MongoDB URI from .env
const client = new MongoClient(url);

async function updateImageInLocation() {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db('geoguesser'); // database
    const locationCollection = db.collection('location'); // collection

    // Path to the new image
    const imagePath = path.join(os.homedir(), 'Desktop', 'mongodb-practice', 'mongodb-with-fastapi', 'mongo-images', 'shapiro-fountain.jpg.64');

    const imageBuffer = await fs.readFile(imagePath);

    const locationId = '67c813a08ad55196c9677609';  // document _id

    // Update the document with the image
    const updateResult = await locationCollection.updateOne(
      { _id: new ObjectId(locationId) },  // find location by _id
      { $set: { image_storage: imageBuffer } }  // set new image storage
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
