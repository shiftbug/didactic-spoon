from flask import Flask, make_response, request, jsonify
import os
import json
import datetime
import threading
from llm import get_completion as llm_call
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor, as_completed

executor = ThreadPoolExecutor()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["http://localhost:5173", "http://frontend:5173"]}})

LOGS_DIR = 'logs'
TASK_FILE_PATH = 'task.json'

if not os.path.exists(LOGS_DIR):
    os.makedirs(LOGS_DIR)

def write_log(log_id, log_entry):
    log_file_path = os.path.join(LOGS_DIR, f"log_{log_id}.json")
    with open(log_file_path, 'w') as log_file:
        json.dump(log_entry, log_file, ensure_ascii=False, indent=4)

@app.route('/tasks', methods=['GET', 'POST'])
def tasks():
    if request.method == 'GET':
        with open(TASK_FILE_PATH, 'r') as file:
            tasks = json.load(file)
        return jsonify(tasks)
    elif request.method == 'POST':
        new_tasks = request.json
        with open(TASK_FILE_PATH, 'w') as file:
            json.dump(new_tasks, file, indent=4)
        return jsonify(new_tasks), 200

@app.route('/process_text', methods=['POST'])
def process_text():
    text = request.form['text']
    processed_text = text
    return jsonify(processed_text=processed_text)

@app.route('/submit', methods=['POST', 'OPTIONS'])
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

        task_file_path = 'task.json'
        if not os.path.exists(task_file_path):
            raise FileNotFoundError("The task configuration file does not exist.")

        with open(task_file_path) as f:
            task_configs = json.load(f)

        max_tier = max(int(task['tier']) for task in tasks)

        for tier in range(1, max_tier + 1):
            tier_tasks = [task for task in tasks if int(task['tier']) == tier]

            app.logger.debug(f"Processing tasks for tier {tier}: {tier_tasks}")

            futures = []  # Store the futures for each task in the current tier

            for task in tier_tasks:
                instance_id = task['instance_id']
                engine_id = task['taskName']
                user_input_checked = task.get('userInputChecked', False)

                app.logger.debug(f"Processing task: {task}")
                app.logger.debug(f"User input checked for task {instance_id}: {user_input_checked}")

                if engine_id in task_configs:
                    task_config = task_configs[engine_id]

                    app.logger.debug(f"Task configuration for {engine_id}: {task_config}")

                    # Get completions from selected lower tier loaders
                    lower_tier_completions = [
                        completion['completion'] for completion in log_entry["completions"]
                        if completion['instance_id'] in [loader['instance_id'] for loader in task['lowerTierLoaders']]
                    ]
                    completions_text = "\n".join(lower_tier_completions)

                    for message in task_config['messages']:
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

                    app.logger.debug(f"Sending task configuration to llm_call for task {instance_id}: {task_config}")
                    future = executor.submit(llm_call, task_config)
                    futures.append((future, instance_id, engine_id))
                else:
                    app.logger.warning(f"No task configuration found for {engine_id}")
                    log_entry["completions"].append({
                        "instance_id": instance_id,
                        "error": f"No task configuration found for {engine_id}"
                    })

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