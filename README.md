# Project Readme

# State of the App.

## 1.1 App.jsx:

- **Central component managing application state (userText, promptLoaders, taskParams)**
- Fetches task parameters from task.json (fetchTaskParams)
- Manages prompt loaders (addPromptLoader, handleTaskNameChange, handleLowerTierOutputsChange)
- Sends user input and selected tasks to backend (/submit)
- Renders ProfileEditor, UserInput, PromptLoader components
- Unfinished connections:
  - taskParams used in PromptLoader but not fully utilized
  - profileEditor not integrated with promptLoaders state

## 1.2 PromptLoader.jsx:

- **Represents individual prompt loader**
- Renders inputs/controls for prompt loader settings
- Displays completion result in read-only textarea
- Updates selected lower-tier outputs (handleLowerTierOutputsChange)
- Unfinished connections:
  - taskParams prop passed but not fully utilized
  - maxTokens prop passed but not used
  - User Input Checkbox not used

## 1.3 ProfileEditor.jsx:

- **Fetches and manages task profiles (tasks state, fetchTaskParams)**
- Allows selecting and editing task profiles
- Saves modified task parameters to backend (/tasks)
- Unfinished connections:
  - taskParams fetched but not used for validation or UI control

## 1.4 [app.py](http://app.py/):

- **Backend server handling task-related operations (/tasks, /submit)**
- Processes user submissions, generates completions (llm_call)
- Uses ThreadPoolExecutor for async processing
- Logs completions and errors
- Unfinished connections:
  - topological_sort function defined but not used
  - No validation or error handling for missing/invalid task configurations

## 1.5 UserInput.jsx:

- **UI for text input (textarea, submit button)**
- Triggers onSubmit callback on button click or "Enter" key
- No unfinished connections observed
- Unfinished connections:
  - User Input checkbox on Prompt Loaders not connected

# Interactions and Data Flow:

- **App.jsx manages state and interactions**
- UserInput sends user input to App.jsx (onSubmit)
- ProfileEditor synchronizes task profiles with backend (/tasks)
- App.jsx sends user input and selected tasks to backend (/submit)
- Backend processes user input, returns completions (/submit, llm_call)
- App.jsx updates promptLoaders state with received completions (handleSubmit)

# Unfinished Functionality or Past Iterations:

- taskParams fetched in App.jsx but not fully utilized in PromptLoader.jsx
- profileEditor component not integrated with promptLoaders state
- maxTokens prop passed to PromptLoader.jsx but not used
- taskParams fetched in ProfileEditor.jsx but not used for validation or UI control
- No integration between ProfileEditor.jsx and App.jsx or PromptLoader.jsx
- topological_sort function defined in [app.py](http://app.py/) but not used in the /submit route
- Lack of validation or error handling for missing/invalid task configurations in [app.py](http://app.py/)

These unfinished connections and unused code elements indicate functionality that is not yet fully implemented or remnants of past iterations that haven't been cleaned up.

Moreover, this groundbreaking application compels profound introspection STILL DOES THO into varying degrees of empathetic predisposition exhibited by users in response to vicarious encounters with divergent emotional stimuli. By discerning gradations in empathic resonance derived from multifaceted empathy dimensions spanning affective concern, perspective-taking aptitude, and interpersonal sensitivity proficiency among others–this avant-garde technological wonder furnishes potent insights applicable across diverse domains ranging from psychological profiling to therapeutic interventions aimed at enhancing mutual understanding and social harmony."
