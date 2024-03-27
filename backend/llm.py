from dotenv import load_dotenv
from openai import OpenAI
import os
import logging
from models import Task

# Load environment variables from .env file
load_dotenv()
# Access the OpenAI API key from the environment variable
api_key = os.getenv('OPENAI_API_KEY')

logging.basicConfig(level=logging.WARNING, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize the OpenAI client
client = OpenAI(api_key=api_key)
# Initialize the ollama client
ollama_client = OpenAI(base_url='http://host.docker.internal:11434/v1/', api_key='ollama',)

def get_completion(task_config, user_id):
    try:
        # Ensure task_config has all the required parameters
        required_params = ['model', 'temperature', 'max_tokens', 'top_p', 'frequency_penalty', 'presence_penalty', 'messages']
        if not all(param in task_config for param in required_params):
            raise ValueError("Missing required parameters in task configuration.")

        # Retrieve user-specific tasks or completions from the database
        user_tasks = Task.query.filter_by(user_id=user_id).all()

        if task_config['model'].startswith("ollama-"):
            # Remove the "ollama-" prefix from the model name
            task_config['model'] = task_config['model'][7:]
            # Call the ollama endpoint with the parameters unpacked from the task_config dictionary
            completion = ollama_client.chat.completions.create(**task_config)
        else:
            # Call the OpenAI API with the parameters unpacked from the task_config dictionary
            completion = client.chat.completions.create(**task_config)

        # Return the completion text
        return completion.choices[0].message.content
    except Exception as e:
        # Log an error message
        logging.error("An error occurred while getting the completion: %s", str(e))
        # Return an error message
        error_message = f"An error occurred while getting the completion: {str(e)}"
        return error_message