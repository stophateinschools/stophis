from flask import Blueprint, render_template
from .auth import login_required

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/home')
@login_required(roles=["admin"])
def home():
    return 'Home!'
