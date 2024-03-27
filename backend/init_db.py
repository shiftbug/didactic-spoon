from app import app, db
from models import User, Task, Log

with app.app_context():
    db.create_all()