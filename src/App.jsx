import { useState } from "react";
import axios from "axios";
import PromptLoader from "./PromptLoader";
import UserInput from "./UserInput";
import "./App.css";
import ProfileEditor from "./ProfileEditor";
import BatchManager from "./BatchManager";
import TaskOrderManager from "./BatchOrder";
// Set axios to send cookies with every request
axios.defaults.withCredentials = true;

function App() {
  // Lift the state up to the App component
  const [tasks, setTasks] = useState([]);
  const [batches, setBatches] = useState([]);
  // State for the user's input text
  const [userText, setUserText] = useState("");
  // State for managing the list of prompt Loaders
  const [promptLoaders, setPromptLoaders] = useState([
    { id: 0, isActive: true, taskName: "", completion: "" },
  ]);

  // Function to add a new prompt Loader to the list
  const addPromptLoader = () => {
    const newLoader = {
      id: promptLoaders.length,
      isActive: true,
      taskName: "",
      completion: "",
    };
    setPromptLoaders([...promptLoaders, newLoader]);
  };

  // Function to handle the submission of the user's text to the backend
  const handleSubmit = async () => {
    // Get only the active Loaders, their task names, and their instance IDs
    const tasks = promptLoaders
      .filter((Loader) => Loader.isActive)
      .map((Loader) => ({
        instance_id: Loader.id,
        taskName: Loader.taskName,
      }));

    // Send the active task names, instance IDs, and user text to the backend
    try {
      const response = await axios.post("http://127.0.0.1:5000/submit", {
        tasks: tasks,
        userText: userText,
      });

      console.log("Response data:", response.data); // Log the response data
      // Update the Loaders with the completions received from the backend
      const updatedLoaders = promptLoaders.map((Loader) => {
        if (Loader.isActive) {
          const completionData = response.data.completions.find(
            (completion) => completion.instance_id === Loader.id
          );
          return {
            ...Loader,
            completion: completionData
              ? completionData.completion
              : "No completion received.",
          };
        }
        return Loader;
      });
      console.log(updatedLoaders); // Add this line to log the updated Loaders

      setPromptLoaders(updatedLoaders);
    } catch (error) {
      console.error("Error submitting Loaders:", error);
      // Error handling should be implemented here
    }
  };

  return (
    <div className="App">
      {/* User input component with handlers for change and submit */}
      <ProfileEditor className="task-m" />
      <UserInput
        className="user-input"
        onChange={(e) => setUserText(e.target.value)}
        value={userText}
        onSubmit={handleSubmit}
      />
      <div className="prompt-Loaders">
        <h2>Profile Selection</h2>
        {/* Map through each prompt Loader and render its component */}
        {promptLoaders.map((Loader, index) => (
          <PromptLoader
            key={Loader.id}
            isActive={Loader.isActive}
            taskName={Loader.taskName}
            completion={Loader.completion}
            onActiveChange={() => {
              // Toggle the active state of the Loader
              const updatedLoaders = promptLoaders.map((mod, modIndex) => {
                if (index === modIndex) {
                  return { ...mod, isActive: !mod.isActive };
                }
                return mod;
              });
              setPromptLoaders(updatedLoaders);
            }}
            onTaskChange={(e) => {
              // Update the task name of the Loader
              const updatedLoaders = promptLoaders.map((mod, modIndex) => {
                if (index === modIndex) {
                  return { ...mod, taskName: e.target.value };
                }
                return mod;
              });
              setPromptLoaders(updatedLoaders);
            }}
          />
        ))}
      </div>
      {/* Button to add a new prompt Loader */}
      <button className="button" onClick={addPromptLoader}>
        Add Output
      </button>
      <div>
        {/* Pass the state down to the child components as props */}
        <BatchManager
          tasks={tasks}
          setTasks={setTasks}
          batches={batches}
          setBatches={setBatches}
        />
        <TaskOrderManager tasks={tasks} setTasks={setTasks} />
      </div>
    </div>
  );
}

export default App;
