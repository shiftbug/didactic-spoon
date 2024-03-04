import { useState } from "react";
import axios from "axios";
import PromptEngine from "./PromptEngine";
import UserInput from "./UserInput";
import "./App.css";
import TaskManager from "./TaskManager";

// Set axios to send cookies with every request
axios.defaults.withCredentials = true;

function App() {
  // State for the user's input text
  const [userText, setUserText] = useState("");
  // State for managing the list of prompt engines
  const [promptEngines, setPromptEngines] = useState([
    { id: 0, isActive: true, taskName: "", completion: "" },
  ]);

  // Function to add a new prompt engine to the list
  const addPromptEngine = () => {
    const newEngine = {
      id: promptEngines.length,
      isActive: true,
      taskName: "",
      completion: "",
    };
    setPromptEngines([...promptEngines, newEngine]);
  };

  // Function to handle the submission of the user's text to the backend
  const handleSubmit = async () => {
    // Get only the active engines, their task names, and their instance IDs
    const tasks = promptEngines
      .filter((engine) => engine.isActive)
      .map((engine) => ({
        instance_id: engine.id,
        taskName: engine.taskName,
      }));

    // Send the active task names, instance IDs, and user text to the backend
    try {
      const response = await axios.post("http://127.0.0.1:5000/submit", {
        tasks: tasks,
        userText: userText,
      });

      console.log("Response data:", response.data); // Log the response data
      // Update the engines with the completions received from the backend
      const updatedEngines = promptEngines.map((engine) => {
        if (engine.isActive) {
          const completionData = response.data.completions.find(
            (completion) => completion.instance_id === engine.id
          );
          return {
            ...engine,
            completion: completionData
              ? completionData.completion
              : "No completion received.",
          };
        }
        return engine;
      });
      console.log(updatedEngines); // Add this line to log the updated engines

      setPromptEngines(updatedEngines);
    } catch (error) {
      console.error("Error submitting Engines:", error);
      // Error handling should be implemented here
    }
  };

  return (
    <div className="App">
      {/* User input component with handlers for change and submit */}
      <TaskManager className="task-m" />
      <UserInput
        className="user-input"
        onChange={(e) => setUserText(e.target.value)}
        value={userText}
        onSubmit={handleSubmit}
      />
      <div className="prompt-engines">
        <h2>Profile Selection</h2>
        {/* Map through each prompt engine and render its component */}
        {promptEngines.map((engine, index) => (
          <PromptEngine
            key={engine.id}
            isActive={engine.isActive}
            taskName={engine.taskName}
            completion={engine.completion}
            onActiveChange={() => {
              // Toggle the active state of the engine
              const updatedEngines = promptEngines.map((mod, modIndex) => {
                if (index === modIndex) {
                  return { ...mod, isActive: !mod.isActive };
                }
                return mod;
              });
              setPromptEngines(updatedEngines);
            }}
            onTaskChange={(e) => {
              // Update the task name of the engine
              const updatedEngines = promptEngines.map((mod, modIndex) => {
                if (index === modIndex) {
                  return { ...mod, taskName: e.target.value };
                }
                return mod;
              });
              setPromptEngines(updatedEngines);
            }}
          />
        ))}
      </div>
      {/* Button to add a new prompt engine */}
      <button className="button" onClick={addPromptEngine}>
        Add Output
      </button>
    </div>
  );
}

export default App;
