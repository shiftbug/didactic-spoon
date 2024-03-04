from flask import Flask, send_from_directory, make_response, render_template, request, jsonify
import os
import json
import datetime
import threading
from llm import get_completion as llm_call
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor, as_completed

# Set up a ThreadPoolExecutor for making llm_calls asynchronously
executor = ThreadPoolExecutor()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:5173"}})

""" FILES_DIR = 'files'

if not os.path.exists(FILES_DIR):
    os.makedirs(FILES_DIR) """

""" @app.route('/')
def index():
    return render_template('index.html') """

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
    # Placeholder function, ensure proper error handling and input validation when implemented
    text = request.form['text']  # Get the text from the form data
    processed_text = text  # Placeholder for actual text processing logic
    return jsonify(processed_text=processed_text)  # Return the processed text as JSON

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
        tasks = data['tasks']  # This should be a list of tasks with instance_id and taskName
        user_text = data['userText']

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

        # Prepare a list to hold futures
        future_to_task = {}

        # Submit tasks to the executor
        for task in tasks:
            instance_id = task['instance_id']
            engine_id = task['taskName']
            if engine_id in task_configs:
                task_config = task_configs[engine_id]
                # Replace placeholder with actual user text
                for message in task_config['messages']:
                    if message['role'] == 'user':
                        message['content'] = user_text
                # Submit the task to the executor
                future = executor.submit(llm_call, task_config)
                future_to_task[future] = (instance_id, engine_id)
            else:
                log_entry["completions"].append({
                    "instance_id": instance_id,
                    "error": f"No task configuration found for {engine_id}"
                })

        # Collect results as they are completed
        for future in as_completed(future_to_task):
            instance_id, engine_id = future_to_task[future]
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

        # Return the completions
        return jsonify(completions=log_entry["completions"])
    except FileNotFoundError as e:
        app.logger.error(f"File not found: {e}")
        return jsonify({'error': 'Configuration file not found.'}), 404
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")
        return jsonify({'error': 'An internal server error occurred.'}), 500

""" @app.route('/list_recent_files', methods=['GET'])
def list_recent_files():
    # List all files in the FILES_DIR directory
    files = os.listdir(FILES_DIR)
    
    # Return the list of files as JSON
    return jsonify(files=files)

@app.route('/files/<filename>')
def file(filename):
    # Serve the requested file from the FILES_DIR directory
    return send_from_directory(FILES_DIR, filename)

@app.route('/load_file', methods=['POST'])
def load_file():
    try:
        filename = request.form.get('filename')  # Get the filename from the form data
        if not filename:
            return jsonify({'error': 'Filename is required.'}), 400  # Return error if no filename is provided
        file_path = os.path.join(FILES_DIR, filename)  # Construct the full file path
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found.'}), 404  # Return error if file doesn't exist
        with open(file_path, 'r') as file:  # Open the file for reading
            content = file.read()  # Read the file content
        return jsonify({'content': content})  # Return the file content as JSON
    except Exception as e:
        app.logger.error(f'An error occurred: {e}')  # Log any exceptions
        return jsonify({'error': 'An internal server error occurred.'}), 500  # Return a server error response
    
@app.route('/save_file', methods=['POST'])
def save_file():
    try:
        filename = request.form['filename']  # Get the filename from the form data
        content = request.form['content']  # Get the file content from the form data
        file_path = os.path.join(FILES_DIR, filename)  # Construct the full file path
        with open(file_path, 'w', encoding='utf-8') as file:  # Open the file for writing with UTF-8 encoding
            file.write(content)  # Write the content to the file
        return jsonify(success=True)  # Return a success response
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")  # Log any exceptions
        return jsonify(error="An internal server error occurred."), 500  # Return a server error response """

if __name__ == '__main__':
    # Start the Flask application with debug mode enabled
    # Note: debug should be set to False in a production environment for security reasons
    app.run(debug=True)