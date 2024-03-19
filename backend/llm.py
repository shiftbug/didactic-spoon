from dotenv import load_dotenv
from openai import OpenAI
import os

# Load environment variables from .env file
load_dotenv()
# Access the OpenAI API key from the environment variable
api_key = os.getenv('OPENAI_API_KEY')
# Initialize the OpenAI client with the API key
client = OpenAI(api_key=api_key)

import logging

# Set up logging configuration
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def get_completion(task_config):
    try:
        logging.debug("Entering get_completion function with task_config: %s", task_config)
        # Ensure task_config has all the required parameters
        required_params = ['model', 'temperature', 'max_tokens', 'top_p', 'frequency_penalty', 'presence_penalty', 'messages']
        if not all(param in task_config for param in required_params):
            raise ValueError("Missing required parameters in task configuration.")

        if task_config['model'].startswith("ollama-"):
            logging.debug("Using ollama endpoint for model: %s", task_config['model'])
            # Initialize the OpenAI client with the ollama endpoint
            ollama_client = OpenAI(
                base_url='http://host.docker.internal:11434/v1/',  # required but ignored
                api_key='ollama',
            )

            # Remove the "ollama-" prefix from the model name
            task_config['model'] = task_config['model'][7:]

            # Call the OpenAI API with the parameters unpacked from the task_config dictionary
            completion = ollama_client.chat.completions.create(**task_config)
        else:
            logging.debug("Using standard OpenAI endpoint for model: %s", task_config['model'])
            # Call the OpenAI API with the parameters unpacked from the task_config dictionary
            completion = client.chat.completions.create(**task_config)

        logging.debug("API call successful, returning completion.")
        # Return the completion text
        return completion.choices[0].message.content
    except Exception as e:
        # Log an error message
        logging.error("An error occurred while getting the completion: %s", str(e))
        # Return an error message
        error_message = f"An error occurred while getting the completion: {str(e)}"
        return error_message