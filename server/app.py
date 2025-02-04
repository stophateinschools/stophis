from flask import Blueprint, render_template
from flask_dance.contrib.google import google
from .auth import login_required

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/home')
@login_required
def home():
    resp = google.get("/oauth2/v2/userinfo")
    print("User home: ", resp.ok, resp.text)
    return 'Home!'
