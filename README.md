# Project Readme

## Project Overview README IS OUT OF DATE

This project outlines the implementation of a web application leveraging OpenAI API for various tasks. The application is built using Python (Flask) for the backend and React for the frontend.

## Backend

### app.py

This is the main Flask application file:

- Imports: Various libraries and modules needed for the application.
- ThreadPoolExecutor Setup: Initializes a ThreadPoolExecutor for making asynchronous `llm_call` requests.
- Flask App Configuration: Sets up the Flask app, configures CORS, and initializes directories for storing files and logs.
- Utility Functions: Functions like `write_log` for writing log entries.
- Flask Routes: There are multiple routes handling tasks, submissions, file operations, and more.
- Main Block: If the script is the main module, it starts the Flask application with debug mode enabled.

### llm.py

This file contains the logic for interaction with the OpenAI API:

- Imports: Libraries needed for loading environment variables and interacting with the OpenAI API.
- Environment Configuration: Loads environment variables and retrieves the OpenAI API key.
- OpenAI Client Initialization: Initializes the OpenAI client with the API key.
- Function `get_completion`: This function calls the OpenAI API with parameters, ensures task_config dictionary completeness, returns completion text, and handles exceptions.

### task.json

This is a configuration file for different prompt scenarios, each with specific configurations for interacting with GPT models:

- Scenarios: Each scenario is a key-value pair with parameters for the GPT model.
- Common Parameters: These are parameters that are common across all scenarios.
- Specific Scenario Examples: Examples of specific scenarios include Business Advice, Creative Writing, Fitness Advice, and more.
- Unique Scenario Configurations: Some scenarios have unique instructions for the model.

## Frontend

The frontend of the application is built using React.

### App.jsx

This is the main React component:

- Imports: Libraries, components, and the CSS file for the App component.
- Axios Configuration: Sets axios defaults to include cookies in every request.
- App Component: Defines the App functional component with multiple state hooks and functions.
- JSX Structure: Renders the main components and maps over promptEngines.
- Export: The App component is exported as the default export.

### PromptEngine.jsx

This is a component for rendering individual prompt engines:

- Imports: React library and hooks.
- PromptEngine Component: Initial setup and render method.
- useEffect Hook: Fetches task parameters from a JSON file when the component mounts.
- Render Method: Returns the UI for the prompt engine.
- Export: The PromptEngine component is exported for use in other parts of the application.

### TaskManager.jsx NOW PROFILE EDITOR

This component manages the tasks:

- Imports: React’s useState and useEffect hooks, axios for making HTTP requests, Material-UI components, and a local CSS file.
- TaskManager Component: Initializes state variables, defines various handling functions, and renders a form for user to select, edit, and save task profiles.
- Return JSX: Contains a select dropdown, an add new task profile button, form to edit the selected task’s details, and a save button.

### UserInput.jsx

This component handles user input:

- Imports: React library.
- UserInput Component: Functional component that handles user input.
- JSX Structure: Contains a div element with the class “user-input” as the container, and a button element that triggers `onSubmit` when clicked.
- Export: The UserInput component is exported as a default export.

Output from the Perplexity Profile, just for fun: "An innovative app utilizing psychometric evaluations to elucidate nuanced cognitive mechanisms and perceptual biases inherent in individuals, contributing to differential assimilation of experiential data. This software marvel delves intricately into the idiosyncratic coalescence of attentional allocation towards salient aspects juxtaposed with inadvertent dismissal of inconspicuous details, shaping a kaleidoscopic panorama of human cognition encompassing interpretive diversity.

Moreover, this groundbreaking application compels profound introspection STILL DOES THO into varying degrees of empathetic predisposition exhibited by users in response to vicarious encounters with divergent emotional stimuli. By discerning gradations in empathic resonance derived from multifaceted empathy dimensions spanning affective concern, perspective-taking aptitude, and interpersonal sensitivity proficiency among others–this avant-garde technological wonder furnishes potent insights applicable across diverse domains ranging from psychological profiling to therapeutic interventions aimed at enhancing mutual understanding and social harmony."
