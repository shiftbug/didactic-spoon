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
    # Retrieve the 'prompt' and 'text' from the POST request's form data
    prompt = request.form['prompt']
    text_content = request.form['text']
    
    # Combine the prompt and text content into a single string
    combined_input = f"{prompt}\n{text_content}"
    
    # Call the completion function from the llm module, passing the combined input
    result = completion(combined_input)

    # Log the type of the result for debugging purposes
    app.logger.debug(f'Result type: {type(result)}')

    # Check if the result is not None and is a string
    if result is not None and isinstance(result, str):
        # Return the result as JSON
        return jsonify(completion=result)
    else:
        # Log an error and return a 500 error if the result is not a string
        app.logger.error('Result is not a string')
        return jsonify({'error': 'Completion result is not a string.'}), 500
    
@app.route('/list_recent_files', methods=['GET'])
def list_recent_files():
    # List all files in the FILES_DIR directory
    files = os.listdir(FILES_DIR)
    
    # Return the list of files as JSON
    return jsonify(files=files)

@app.route('/files/<filename>')
def file(filename):
    # Serve the requested file from the FILES_DIR directory
    return send_from_directory(FILES_DIR, filename)

if __name__ == '__main__':
    # Start the Flask application with debug mode enabled
    # Note: debug should be set to False in a production environment for security reasons
    app.run(debug=True)