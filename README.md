## geo_db API Access Guide

Here are instructions on how to interact with geo_db API, which is built using FastAPI and connected to a MongoDB Atlas database.
The API allows the management of location records with CRUD (Create, Read, Update, Delete).

### MongoDB for VS Code Setup

#### 1. Install MongoDB for VS Code.
In VS Code, open "Extensions" in the left navigation and search for "MongoDB for VS Code." Select the extension and click install.

#### 2. In VS Code, open the Command Palette.
Click on "View" and open "Command Palette."
Search "MongoDB: Connect" on the Command Palette and click on "Connect with Connection String."

#### 3. Connect to your MongoDB deployment.
Paste your connection string into the Command Palette:

mongodb+srv://user0:<db_password>@cluster0.hnm2u.mongodb.net/

Replace <db_password> with the password for the user0 database user (shared in Discord).

#### 4. Click "Create New Playground" in MongoDB for VS Code to get started.

### API Endpoints

#### 1.   POST/locations/ - creates a new location

#### 2.   GET/locations/ - view a list of all locations

#### 3.   GET/locations/{id} - view a single location by its ID

#### 4.   PUT/locations/{id} - update a location by its ID

#### 5.   DELETE/locations/{id} - delete a location by its ID

