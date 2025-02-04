import os
from flask import redirect, url_for, abort
from flask_dance.contrib.google import google, make_google_blueprint
from functools import wraps
import requests
from .user import User, create_user
from .database import db

def login_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        if not google.authorized:
            return abort(401)
        else:
            return function()
    return wrapper

# Google OAuth Blueprint
auth = make_google_blueprint(
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    scope=['profile', 'email'],
    redirect_to="google.google_authorized_wrapper",
)

# Route for handling Google callback after authentication
@auth.route('/authorized')
@login_required
def google_authorized_wrapper():
    # Check if the user is authorized
    if not google.authorized:
        return redirect(url_for('google.login'))  # Redirect to Google login if not authorized

    resp = google.get("/oauth2/v2/userinfo")

    create_user(resp.json())

    # Redirect to home after successful login
    return redirect(url_for('main.home'))

@auth.route('/login')
def google_login_wrapper():
  if not google.authorized:
      return redirect(url_for("google.login"))

  return redirect(url_for('google.authorized'))
  
# Logout route
@auth.route('/logout')
@login_required
def google_logout_wrapper():
    # Revoke the Google OAuth token
    if google.authorized:
        resp = requests.post(
            'https://oauth2.googleapis.com/revoke',
            params={'token': auth.token['access_token']},
            headers={'content-type': 'application/x-www-form-urlencoded'}
        )
        if resp.status_code == 200:
            print('Token successfully revoked')
        else:
            print('Failed to revoke token')
            
    google.session = None # Logout from Google
    return redirect(url_for('main.index'))