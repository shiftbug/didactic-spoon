from dotenv import load_dotenv
from openai import OpenAI
import os

# Load environment variables from .env file
load_dotenv()
# Access the OpenAI API key from the environment variable
api_key = os.getenv('OPENAI_API_KEY')
# Initialize the OpenAI client with the API key
client = OpenAI(api_key=api_key)

def get_completion(task_config):

    try:
        # Ensure task_config has all the required parameters
        required_params = ['model', 'temperature', 'max_tokens', 'top_p', 'frequency_penalty', 'presence_penalty', 'messages']
        if not all(param in task_config for param in required_params):
            raise ValueError("Missing required parameters in task configuration.")

        # Call the OpenAI API with the parameters unpacked from the task_config dictionary
        completion = client.chat.completions.create(**task_config)

        # Return the completion text
        return completion.choices[0].message.content
    except Exception as e:
        # Return an error message
        error_message = f"An error occurred while getting the completion: {str(e)}"
        return error_message