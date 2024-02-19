from openai import OpenAI

import os 

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))   



def llm_call(prompt):
    completion = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a poetic assistant, skilled in explaining complex programming concepts with creative flair."},
        {"role": "user", "content": prompt}
    ]
    )

    print(completion.choices[0].message)


