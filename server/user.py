from .database import db

class User(db.Model):
  """A user."""
  __tablename__ = "users"

  id = db.Column(db.Integer(), primary_key=True)
  google_id = db.Column(db.String(), nullable=True)
  first_name = db.Column(db.String(), nullable=False)
  last_name = db.Column(db.String(), nullable=False)
  email = db.Column(db.String(), nullable=False, unique=True)
  profile_picture = db.Column(db.String())

  def __str__(self):
    return f"{self.first_name} {self.last_name}: {self.email}"
  
def create_user(user):
    existing_user = User.query.filter_by(email=user["email"]).first()
    if existing_user:
        print('EXISTING USER ', existing_user)
        existing_user.google_id = user["id"]
        existing_user.profile_picture = user["picture"]
    else:
       new_user = User(
          google_id=user["id"],
          first_name=user["given_name"],
          last_name=user["family_name"],
          email=user["email"],
          profile_picture=user["picture"],
       )
       db.session.add(new_user)

    db.session.commit()