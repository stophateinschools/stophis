from server import create_app

app = create_app()

def login_required(function):
    def wrapper(*args, **kwargs):
        return function()
        # if "google_id" not in session:
        #     return abort(401)
        # else:
        #     return function()
    return wrapper

@app.route("/login")
def login():
    # Forward to google login screen
    pass

@app.route("/callback")
def callback():
    # Recieve data back from google login
    pass

@app.route("/logout")
def logout():
    pass

@app.route('/')
def index():
    return 'Hello, Flask!!'

@app.route('/home')
@login_required
def home():
    return 'Home!'
