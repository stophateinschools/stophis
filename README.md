# Stop Hate in Schools

# Setup
We will use pyenv and pipenv to manage installing python and to manage and create virtual environments. A virtual environment is useful to ensure not only each dev is developing with the same tools and versions, but also to ensure our dev environment will be consistent with deployed environments.

## Setup environment variables
1. Make a copy of `.env.example` and call it `.env`
2. Reach out to team member to make sure you have all the correct variables in `.env`
3. Run `source .env` to load into shell

## Install pyenv
1. `brew install pyenv`
2. [Edit](https://github.com/pyenv/pyenv?tab=readme-ov-file#b-set-up-your-shell-environment-for-pyenv) shell start up script depending on which configuration you use
3. Restart shell for `PATH` changes to take effect - `exec "$SHELL"`

## Boostrap to setup virtual env
1. Add `export PYTHON_VERSION=3.13.1` to your shell and source the file (ex. `source ~/.zshrc`)
2. `pip install --upgrade pip` and `pip install pipenv`
You will be able to create a virtual environment in the directory where our `Pipfile` and `Pipfile.lock` live. The Pipfile secifies the packages that will be installed in your virtual environment.
3. Run `./bootstrap` script - see script for step by step details
4. Run `pipenv install` - to install all packages in Pipfile
5. Run `pipenv shell` to enter your virtual environment

## Database
### [Docker and Postgresql](https://www.docker.com/blog/how-to-use-the-postgres-docker-official-image/)
1. Download latest [docker desktop](https://www.docker.com/products/docker-desktop/)
2. Pull latest postgres image in from docker terminal - `docker pull postgres`
3. Now we can run a postgres instance (aka container) `docker run --name stophis -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres`
4. Now you can access the postgres container to execute psql queries with: `docker exec -it stophis psql -U postgres`
5. Run `CREATE DATABASE stophis` query

### [Alembic](https://alembic.sqlalchemy.org/en/latest/front.html)
- Our relational tables will be managed using alembic
- In order to autogenerate a revision based on your sqlalchemy model changes, you can run `pipenv run alembic revision --autogenerate -m "_message_here_"`
	or to get a blank revision, you can run `pipenv run alembic revision -m "_message_here_"

## Run locally
Run

```bash
pipenv run flask run
```

## Run tests
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

