from flask import session, abort, Blueprint

main = Blueprint('main', __name__)

def login_required(function):
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return abort(401)
        else:
            return function()
    return wrapper

@main.route("/login")
def login():
    # Forward to google login screen
    pass

@main.route("/callback")
def callback():
    # Recieve data back from google login
    pass

@main.route("/logout")
def logout():
    pass

@main.route('/')
def index():
    return 'Hello, Flask!!'

@main.route('/home')
@login_required
def home():
    return 'Home!'
