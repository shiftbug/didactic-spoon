from flask import Flask, make_response, request, jsonify
import os
import json
import datetime
import threading
from llm import get_completion as llm_call
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging
from logging.handlers import RotatingFileHandler
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from models import db, User, Task, Log
from auth import auth_bp

executor = ThreadPoolExecutor()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

jwt = JWTManager(app)
db.init_app(app)

app.register_blueprint(auth_bp, url_prefix='/api')

LOGS_DIR = 'logs'
TASK_FILE_PATH = os.path.join(os.path.dirname(__file__), 'task.json')

if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

if not app.debug:
    handler = RotatingFileHandler('logs/app.log', maxBytes=100000, backupCount=3)
    handler.setLevel(logging.WARNING)
    app.logger.addHandler(handler)

def write_log(log_id, log_entry):
    log_file_path = os.path.join(LOGS_DIR, f"log_{log_id}.json")
    with open(log_file_path, 'w') as log_file:
        json.dump(log_entry, log_file, ensure_ascii=False, indent=4)

@app.route('/health')
def health():
    return jsonify(status='healthy')

@app.errorhandler(404)
def resource_not_found(e):
    return jsonify(error=str(e)), 404

@app.errorhandler(500)
def internal_server_error(e):
    return jsonify(error=str(e)), 500

@app.route('/tasks', methods=['GET'])
@jwt_required()
def tasks():
    user_id = get_jwt_identity()
    print(f"Fetching tasks for user ID: {user_id}")

    user_tasks = Task.query.filter_by(user_id=user_id).all()
    print("Tasks retrieved from the database:")
    #print(f"{user_tasks}")

    task_data = []
    for task in user_tasks:
        task_info = {
            'id': task.id,
            'task_name': task.task_name,
            'max_tokens': task.max_tokens
        }
        task_data.append(task_info)

    print("Task data to be returned: ")
    print(f"{task_data}")  
    return jsonify(task_data)

@app.route('/taskparams', methods=['POST'])
@app.route('/taskparams/<int:task_id>', methods=['GET', 'PUT', 'PATCH'])
@jwt_required()
def task_params(task_id=None):
    if request.method == 'POST':
        data = request.get_json()
        user_id = get_jwt_identity()
        new_task = Task(
            user_id=user_id,
            task_name=data['task_name'],
            model=data['model'],
            max_tokens=data['max_tokens'],
            temperature=data['temperature'],
            top_p=data['top_p'],
            frequency_penalty=data['frequency_penalty'],
            presence_penalty=data['presence_penalty'],
            messages=data['messages']
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify(id=new_task.id), 201

    if task_id is None:
        return jsonify({'error': 'Task ID is required'}), 400

    task = Task.query.get(task_id)
    if task is None:
        return jsonify({'error': 'Task not found'}), 404

    if request.method == 'GET':
        task_info = {
            'id': task.id,
            'task_name': task.task_name,
            'model': task.model,
            'max_tokens': task.max_tokens,
            'temperature': task.temperature,
            'top_p': task.top_p,
            'frequency_penalty': task.frequency_penalty,
            'presence_penalty': task.presence_penalty,
            'messages': task.messages
        }
        return jsonify(task_info)

    elif request.method in ['PUT', 'PATCH']:
        data = request.get_json()
        task.task_name = data.get('task_name', task.task_name)
        task.model = data.get('model', task.model)
        task.max_tokens = data.get('max_tokens', task.max_tokens)
        task.temperature = data.get('temperature', task.temperature)
        task.top_p = data.get('top_p', task.top_p)
        task.frequency_penalty = data.get('frequency_penalty', task.frequency_penalty)
        task.presence_penalty = data.get('presence_penalty', task.presence_penalty)
        task.messages = data.get('messages', task.messages)
        db.session.commit()
        return jsonify({'message': 'Task updated successfully'}), 200
@app.route('/process_text', methods=['POST'])
def process_text():
    text = request.form['text']
    processed_text = text
    return jsonify(processed_text=processed_text)

@app.route('/submit', methods=['POST', 'OPTIONS'], endpoint='submit_endpoint')
@jwt_required()
def submit():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Max-Age', '86400')
        return response

    try:
        user_id = get_jwt_identity()
        data = request.json
        tasks = data['tasks']
        user_text = data['userText']

        app.logger.debug(f"Received tasks: {tasks}")
        app.logger.debug(f"Received user text: {user_text}")

        log_id = datetime.datetime.now().strftime("%Y%m%d-%H%M%S%f")
        log_entry = {
            "timestamp": log_id,
            "tasks": tasks,
            "input": user_text,
            "completions": []
        }

        max_tier = max(int(task['tier']) for task in tasks)

        for tier in range(1, max_tier + 1):
            tier_tasks = [task for task in tasks if int(task['tier']) == tier]

            app.logger.debug(f"Processing tasks for tier {tier}: {tier_tasks}")

            futures = []  # Store the futures for each task in the current tier

            for task in tier_tasks:
                instance_id = task['instance_id']
                task_id = task['task_id']  # Assuming the task ID is included in the task data
                user_input_checked = task.get('userInputChecked', False)

                app.logger.debug(f"Processing task: {task}")
                app.logger.debug(f"User input checked for task {instance_id}: {user_input_checked}")

                task_config = Task.query.get(task_id)  # Fetch the task configuration from the database
                if task_config is None:
                    app.logger.warning(f"No task configuration found for task ID {task_id}")
                    log_entry["completions"].append({
                        "instance_id": instance_id,
                        "error": f"No task configuration found for task ID {task_id}"
                    })
                    continue

                # Convert the task_config object to a dictionary
                task_config_dict = {
                    'id': task_config.id,
                    'task_name': task_config.task_name,
                    'model': task_config.model,
                    'max_tokens': task_config.max_tokens,
                    'temperature': task_config.temperature,
                    'top_p': task_config.top_p,
                    'frequency_penalty': task_config.frequency_penalty,
                    'presence_penalty': task_config.presence_penalty,
                    'messages': task_config.messages
                }

                # Get completions from selected lower tier loaders
                lower_tier_completions = [
                    completion['completion'] for completion in log_entry["completions"]
                    if completion['instance_id'] in [loader['instance_id'] for loader in task['lowerTierLoaders']]
                ]
                completions_text = "\n".join(lower_tier_completions)

                for message in task_config_dict['messages']:
                    if message['role'] == 'user':
                        content = message['content']
                        if user_input_checked:
                            content = content.replace('<<user_input>>', user_text)
                            app.logger.debug(f"User text included for task {instance_id}: {user_text}")
                        else:
                            content = content.replace('<<user_input>>', "")
                            app.logger.debug(f"User text excluded for task {instance_id}")
                        content = content.replace('<<completions>>', completions_text)
                        message['content'] = content

                app.logger.debug(f"Sending task configuration to llm_call for task {instance_id}: {task_config_dict}")
                with app.app_context():
                    future = executor.submit(llm_call, task_config_dict, user_id)
                futures.append((future, instance_id, task_config.task_name))

            # Wait for all futures in the current tier to complete before moving to the next tier
            for future, instance_id, engine_id in futures:
                try:
                    completion = future.result()
                    log_entry["completions"].append({
                        "instance_id": instance_id,
                        "engine_id": engine_id,
                        "completion": completion
                    })
                except Exception as exc:
                    app.logger.error(f"Task {instance_id} generated an exception: {exc}")
                    log_entry["completions"].append({
                        "instance_id": instance_id,
                        "error": str(exc)
                    })

        # Asynchronously write the log entry
        threading.Thread(target=write_log, args=(log_id, log_entry)).start()

        app.logger.debug(f"Completions: {log_entry['completions']}")
        return jsonify(completions=log_entry["completions"])

    except FileNotFoundError as e:
        app.logger.error(f"File not found: {e}")
        return jsonify({'error': 'Configuration file not found.'}), 404
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")
        return jsonify({'error': 'An internal server error occurred.'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)