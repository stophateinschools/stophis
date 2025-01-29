# Server Setup
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
2. Run `./bootstrap` script - see script for step by step details

1. `pip install --upgrade pip` and `pip install pipenv`
You will be able to create a virtual environment in the directory where our `Pipfile` and `Pipfile.lock` live. The Pipfile secifies the packages that will be installed in your virtual environment.
2. Run `pipenv install` - to install all packages in Pipfile
3. Run `pipenv shell` to enter your virtual environment

## Docker and Postgresql


## Run Locally
Run

```bash
pipenv run flask run
```
