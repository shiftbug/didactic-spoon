from flask import Flask, render_template, request, jsonify, send_from_directory
import os

app = Flask(__name__)

# Assuming you have a directory named 'files' for storing text files
FILES_DIR = 'files'

# Ensure FILES_DIR exists
if not os.path.exists(FILES_DIR):
    os.makedirs(FILES_DIR)  # Good: Creates the directory if it doesn't exist

@app.route('/')
def index():
    return render_template('index.html')  # Good: Renders the main page

@app.route('/load_file', methods=['POST'])
def load_file():
    try:
        filename = request.form.get('filename')
        if not filename:
            return jsonify({'error': 'Filename is required.'}), 400
        file_path = os.path.join(FILES_DIR, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found.'}), 404
        with open(file_path, 'r') as file:
            content = file.read()
        return jsonify({'content': content})
    except Exception as e:
        app.logger.error(f'An error occurred: {e}')
        return jsonify({'error': 'An internal server error occurred.'}), 500
    
@app.route('/save_file', methods=['POST'])
def save_file():
    try:
        filename = request.form['filename']  # Same potential KeyError as above
        content = request.form['content']  # Same potential KeyError as above
        file_path = os.path.join(FILES_DIR, filename)
        with open(file_path, 'w') as file:  # Potential Issue: Encoding not specified
            file.write(content)
        return jsonify(success=True)
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")  # Good: Logs the exception
        return jsonify(error="An internal server error occurred."), 500  # Good: Returns an error response

@app.route('/process_text', methods=['POST'])
def process_text():
    # Placeholder function, ensure proper error handling and input validation when implemented
    text = request.form['text']
    processed_text = text  # Placeholder for actual text processing
    return jsonify(processed_text=processed_text)

@app.route('/get_completion', methods=['POST'])
def get_completion():
    # Placeholder function, ensure to implement the logic and error handling
    prompt = request.form['prompt']
    # TODO: Implement logic to send the prompt to OpenAI and get the completion
    # TODO: Return the completion to the frontend
    pass  # Placeholder, replace with actual implementation

@app.route('/list_recent_files', methods=['GET'])
def list_recent_files():
    # Good: Lists files in the FILES_DIR directory
    files = os.listdir(FILES_DIR)
    return jsonify(files=files)

@app.route('/files/<filename>')
def file(filename):
    # Good: Sends a file from the FILES_DIR directory
    return send_from_directory(FILES_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True)  # Warning: Ensure debug is False in production