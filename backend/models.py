from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    frontend_state = db.Column(db.JSON, nullable=True)
    logs = db.relationship('Log', backref='user', lazy=True)
    tasks = db.relationship('Task', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    task_name = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    max_tokens = db.Column(db.Integer, nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    top_p = db.Column(db.Float, nullable=False)
    frequency_penalty = db.Column(db.Float, nullable=False)
    presence_penalty = db.Column(db.Float, nullable=False)
    messages = db.Column(db.JSON, nullable=False)

class Log(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    log_data = db.Column(db.JSON, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)