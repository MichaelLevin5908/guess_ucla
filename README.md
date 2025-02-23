# guess_ucla

# setup process
____

If running locally you will need .env file describing your authentication properties

`REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com`

`REACT_APP_AUTH0_CLIENT_ID=your-client-id`


### Instructions to Run Database

* cd into guessucla/src/db/.venv
* `source .venv/Scripts/activate` activates the virtual environment that contains the commands needed
* `uvicorn main:app --reload` to start up database
* open the local ip address into browser and append /docs to view database
    * `http://127.0.0.1:8000/docs`

### Docker

____

The docker file setups your environment correctly and runs the application in an Ubuntu server
