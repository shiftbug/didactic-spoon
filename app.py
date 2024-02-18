from flask import Flask, render_template, request, jsonify, send_from_directory
import os

app = Flask(__name__)

# Assuming you have a directory named 'files' for storing text files
FILES_DIR = 'files'

# Ensure FILES_DIR exists
if not os.path.exists(FILES_DIR):
    os.makedirs(FILES_DIR)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/load_file', methods=['POST'])
def load_file():
    filename = request.form['filename']
    file_path = os.path.join(FILES_DIR, filename)
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            content = file.read()
        return jsonify(content=content)
    else:
        return jsonify(error="File not found"), 404

@app.route('/save_file', methods=['POST'])
def save_file():
    filename = request.form['filename']
    content = request.form['content']
    file_path = os.path.join(FILES_DIR, filename)
    with open(file_path, 'w') as file:
        file.write(content)
    return jsonify(success=True)

@app.route('/process_text', methods=['POST'])
def process_text():
    text = request.form['text']
    # Here you would apply your processing filters to the text
    processed_text = text  # Placeholder for actual text processing
    return jsonify(processed_text=processed_text)

@app.route('/get_completion', methods=['POST'])
def get_completion():
    prompt = request.form['prompt']
    # Logic to send the prompt to OpenAI and get the completion
    # Return the completion to the frontend

@app.route('/list_recent_files', methods=['GET'])
def list_recent_files():
    # List files in the FILES_DIR directory
    files = os.listdir(FILES_DIR)
    return jsonify(files=files)

@app.route('/files/<filename>')
def file(filename):
    return send_from_directory(FILES_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True)