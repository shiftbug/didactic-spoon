from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from llm import llm_call as completion


# Load your OpenAI API key from an environment variable for security


app = Flask(__name__)  # Initialize the Flask application

# Assuming you have a directory named 'files' for storing text files
FILES_DIR = 'files'  # Define the directory where files will be stored

# Ensure FILES_DIR exists
if not os.path.exists(FILES_DIR):
    os.makedirs(FILES_DIR)  # Create the directory if it doesn't exist

@app.route('/')
def index():
    return render_template('index.html')  # Serve the main page template

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
        return jsonify(error="An internal server error occurred."), 500  # Return a server error response

@app.route('/process_text', methods=['POST'])
def process_text():
    # Placeholder function, ensure proper error handling and input validation when implemented
    text = request.form['text']  # Get the text from the form data
    processed_text = text  # Placeholder for actual text processing logic
    return jsonify(processed_text=processed_text)  # Return the processed text as JSON

@app.route('/get_completion', methods=['POST'])
def get_completion():
    prompt = request.form['prompt']
    text_content = request.form['text']
    combined_input = f"{prompt}\n{text_content}"
    result = completion(combined_input)

    # Log the type and attributes of the result for debugging
    app.logger.debug(f'Result type: {type(result)}')
    if hasattr(result, '__dict__'):
        app.logger.debug(f'Result attributes: {result.__dict__}')

    if result is not None:
        if hasattr(result, 'content'):
            return jsonify(completion=result.content)
        else:
            app.logger.error('Result does not have a content attribute')
            return jsonify({'error': 'Completion result does not have a content attribute.'}), 500
    else:
        app.logger.error('Completion function returned None')
        return jsonify({'error': 'Completion function did not return any result.'}), 500
    
@app.route('/list_recent_files', methods=['GET'])
def list_recent_files():
    files = os.listdir(FILES_DIR)  # List all files in the FILES_DIR directory
    return jsonify(files=files)  # Return the list of files as JSON

@app.route('/files/<filename>')
def file(filename):
    return send_from_directory(FILES_DIR, filename)  # Serve the requested file from the FILES_DIR directory

if __name__ == '__main__':
    app.run(debug=True)  # Start the Flask application with debug mode enabled (should be False in production)