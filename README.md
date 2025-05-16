# Stop Hate in Schools

# Setup
We will use Docker Compose locally to manage and run our dev application. Similar to virtual env, each of our docker containers provides us with an isolated environment.

## Setup environment variables
1. Make a copy of `.env.example` and call it `.env`
2. Reach out to team member to make sure you have all the correct variables in `.env`
3. Run `source .env` to load into shell

## Docker Compose
1. Download latest [docker desktop](https://www.docker.com/products/docker-desktop/)
2. Run `docker compose up --build`
3. Our app will now be available at http:localhost:3000 - I recommend also opening a terminal tab with the docker shell by running `docker compose exec server bash` so you can execute container commands

### [Alembic](https://alembic.sqlalchemy.org/en/latest/front.html)
- Our relational tables will be managed using alembic
- In order to autogenerate a revision based on your sqlalchemy model changes, you can run `alembic revision --autogenerate -m "_message_here_"` inside the docker shell or to get a blank revision, you can run `alembic revision -m "_message_here_"

### Database
- Establish connection to your local postgresql database and run sql queryies by running `docker compose exec db psql -U postgres -d stophis`

## Run tests
### TODO Update this with docker vs pipenv
Run `pipenv run tox` to run entire test suite

Run `pipenv run tox -- tests/_testfile_.py` or `pipenv run tox --tests/_testfile_.py::_testname_` if you would like to run a single test file or test, respectively

# Data management
The inital version of this application depends on fetching data from the National Center for Education Statistics(NCES)[https://nces.ed.gov] and syncing with existing tables in our Airtable project. NOTE: These steps currently work with public school and district data ONLY.
To fetch from NCES:
1. Navigate to our admin page and click "Manage Data" tab
2. Where you see "Fetch NCES Data by State", select desired state and click "Submit"
	a. NOTE: A popup will appear when the job starts and finishes - when it says "this may take several minutes" that is true! So just be patient - if an error occurs a popup will also alert on that
3. After upload is complete, you will be able to see the fetched state's school and district data in the corresponding admin tables

To sync from Airtable:
1. Navigate to admin page and click "Manage Data" tab
2. Where you see "Sync from Airtable", choose your state and table you are wanting to sync data from and click "Sync"
3. After sync is complete, you will be navigated to the list view of data you just synced

