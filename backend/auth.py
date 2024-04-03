from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import Task, User, db
import json
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return jsonify({'error': 'Username, email, and password are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Fetch default tasks
    default_tasks = Task.query.filter_by(user_id=None).all()

    # Create new tasks for the user
    for default_task in default_tasks:
        new_task = Task(
            user_id=user.id,
            task_name=default_task.task_name,
            model=default_task.model,
            max_tokens=default_task.max_tokens,
            temperature=default_task.temperature,
            top_p=default_task.top_p,
            frequency_penalty=default_task.frequency_penalty,
            presence_penalty=default_task.presence_penalty,
            messages=default_task.messages
        )
        db.session.add(new_task)

    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token}), 200