import json
from app import app, db
from models import User, Task, Log

def setup_database(app, db):
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
        
        # Check if the database is empty
        if not User.query.first() and not Task.query.first() and not Log.query.first():
            # Load tasks from task.json
            with open('task.json', 'r') as f:
                tasks_data = json.load(f)

            # Transform and insert tasks
            for task_name, task_data in tasks_data.items():
                task = Task(
                    user_id=None,  # Default tasks have null user_id
                    task_name=task_name,
                    model=task_data['model'],
                    max_tokens=task_data['max_tokens'],
                    temperature=task_data['temperature'],
                    top_p=task_data['top_p'],
                    frequency_penalty=task_data['frequency_penalty'],
                    presence_penalty=task_data['presence_penalty'],
                    messages=task_data['messages']
                )
                db.session.add(task)

            db.session.commit()  # Commit the transaction

# Call the setup function with your Flask app and database
setup_database(app, db)