# Import the OpenAI library which allows us to interact with the OpenAI API.
from openai import OpenAI

# Import the os module to interact with the operating system.
import os 

# Create an OpenAI client instance. This client will be used to make requests to the OpenAI API.
# The API key is retrieved from the environment variable 'OPENAI_API_KEY'.
# This is a secure way to handle credentials.
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))   

# Define a function named 'llm_call' which takes a single argument 'prompt'.
# This function will send the prompt to the OpenAI API and return the response.
def llm_call(prompt):
    # Call the OpenAI API's chat completion method with the specified parameters.
    # 'model' specifies the language model to use, in this case, 'gpt-3.5-turbo'.
    # 'max_tokens' defines the maximum length of the generated response.
    # 'messages' is a list of message objects that represent the conversation history.
    # The first message sets the role to 'system' and provides instructions for the AI.
    # The second message sets the role to 'user' and passes the user's prompt.
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        max_tokens=200,
        messages=[
            {"role": "system", "content": "You are a writing assistant skilled in approximating perspectives on a text."},
            {"role": "user", "content": prompt}
        ]
    )

    # Return the message part of the first choice from the completion.
    # The API's response includes a list of choices, and we are interested in the message
    # of the first one, which contains the generated text.
    return(completion.choices[0].message)