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

def topological_sort(tasks):
    # Create a dictionary to store the adjacency list representation of the task dependencies
    graph = {task['instance_id']: [dep['instance_id'] for dep in task['lowerTierLoaders']] for task in tasks}
    
    # Create a set to keep track of visited tasks
    visited = set()
    
    # Create a stack to store the sorted tasks
    stack = []
    
    # Helper function for depth-first search (DFS)
    def dfs(task_id):
        visited.add(task_id)
        
        # Recursively visit all dependencies
        for dep_id in graph[task_id]:
            if dep_id not in visited:
                dfs(dep_id)
        
        stack.append(task_id)
    
    # Perform DFS for each task
    for task_id in graph:
        if task_id not in visited:
            dfs(task_id)
    
    # Reverse the stack to get the topologically sorted order
    sorted_tasks = stack[::-1]
    
    return sorted_tasks

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

            future_to_task = {}
            for task in tier_tasks:
                instance_id = task['instance_id']
                engine_id = task['taskName']

                if engine_id in task_configs:
                    task_config = task_configs[engine_id]
                    
                    # Get completions from selected lower tier loaders
                    lower_tier_completions = [
                        completion['completion'] for completion in log_entry["completions"]
                        if completion['instance_id'] in [loader['instance_id'] for loader in task['lowerTierLoaders']]
                    ]
                    completions_text = "\n".join(lower_tier_completions)

                    for message in task_config['messages']:
                        if message['role'] == 'user':
                            content = message['content']
                            content = content.replace('<<user_input>>', user_text)
                            content = content.replace('<<completions>>', completions_text)
                            message['content'] = content

                    future = executor.submit(llm_call, task_config)
                    future_to_task[future] = (instance_id, engine_id)
                else:
                    log_entry["completions"].append({
                        "instance_id": instance_id,
                        "error": f"No task configuration found for {engine_id}"
                    })

            # Wait for tier tasks to complete and collect results
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

if __name__ == '__main__':
    # Start the Flask application with debug mode enabled
    # Note: debug should be set to False in a production environment for security reasons
    app.run(debug=True)