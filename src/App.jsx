import { useState, useEffect } from "react";
import axios from "axios";
import PromptLoader from "./PromptLoader";
import UserInput from "./UserInput";
import "./App.css";
import ProfileEditor from "./ProfileEditor";

// Configure axios to automatically send cookies with every request
axios.defaults.withCredentials = true;

function App() {
  // State to store the user's input text
  const [userText, setUserText] = useState("");
  // State to store an array of prompt loader objects
  const [promptLoaders, setPromptLoaders] = useState([
    {
      id: 0,
      isActive: true,
      taskName: "",
      completion: "",
      tier: 1,
      lowerTierOutputs: [],
    },
  ]);
  // State to store the task parameters
  const [taskParams, setTaskParams] = useState({});

  useEffect(() => {
    fetchTaskParams();
  }, []);

  const fetchTaskParams = async () => {
    try {
      const response = await fetch("task.json");
      const data = await response.json();
      setTaskParams(data);
    } catch (error) {
      console.error("Error fetching task parameters:", error);
    }
  };

  // Function to add a new prompt loader to the state array
  const addPromptLoader = () => {
    const newLoader = {
      id: promptLoaders.length,
      isActive: true,
      taskName: "",
      completion: "",
      tier: 1,
      lowerTierOutputs: [],
    };
    setPromptLoaders([...promptLoaders, newLoader]);
  };
  const handleTaskNameChange = (loaderId, taskName) => {
    setPromptLoaders((prevLoaders) =>
      prevLoaders.map((loader) => {
        const updatedLowerTierLoaders = loader.lowerTierOutputs.map(
          (output) => {
            if (output.id === loaderId) {
              return { ...output, taskName: taskName };
            }
            return output;
          }
        );
        return { ...loader, lowerTierOutputs: updatedLowerTierLoaders };
      })
    );
  };
  const handleLowerTierOutputsChange = (id, lowerTierLoader) => {
    setPromptLoaders((prevLoaders) =>
      prevLoaders.map((loader) => {
        if (loader.id === id) {
          const lowerTierOutputIndex = loader.lowerTierOutputs.findIndex(
            (output) => output.id === lowerTierLoader.id
          );
          if (lowerTierOutputIndex !== -1) {
            // Remove the lower tier loader if it exists
            return {
              ...loader,
              lowerTierOutputs: loader.lowerTierOutputs.filter(
                (output) => output.id !== lowerTierLoader.id
              ),
            };
          } else {
            // Add the lower tier loader if it doesn't exist
            return {
              ...loader,
              lowerTierOutputs: [...loader.lowerTierOutputs, lowerTierLoader],
            };
          }
        }
        return loader;
      })
    );
  };

  const handleSubmit = async () => {
    const tasks = promptLoaders
      .filter((Loader) => Loader.isActive)
      .map((Loader) => ({
        instance_id: Loader.id,
        taskName: Loader.taskName,
        tier: Loader.tier,
        lowerTierLoaders: Loader.lowerTierOutputs.map((loader) => ({
          instance_id: loader.id,
          taskName: loader.taskName,
        })),
      }));

    console.log("Tasks sent to backend:", tasks);

    if (tasks.length) {
      try {
        const response = await axios.post("http://127.0.0.1:5000/submit", {
          tasks: tasks,
          userText: userText,
        });

        console.log("Response from backend:", response.data);

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
        setPromptLoaders(updatedLoaders);
      } catch (error) {
        console.error("Error submitting Loaders:", error);
      }
    }
  };

  return (
    <div className="App">
      {/* User input component with handlers for change and submit events */}
      <ProfileEditor className="task-m" />
      <UserInput
        className="user-input"
        onChange={(e) => setUserText(e.target.value)}
        value={userText}
        onSubmit={handleSubmit}
      />
      {/* Map over promptLoaders and render a PromptLoader component for each */}
      <div className="prompt-Loaders">
        <h2>Profile Selection</h2>
        {promptLoaders.map((Loader, index) => (
          <PromptLoader
            key={Loader.id}
            isActive={Loader.isActive}
            taskName={Loader.taskName}
            onLowerTierOutputsChange={(lowerTierLoader) =>
              handleLowerTierOutputsChange(Loader.id, lowerTierLoader)
            }
            completion={Loader.completion}
            tier={Loader.tier}
            lowerTierOutputs={Loader.lowerTierOutputs}
            lowerTierLoaders={promptLoaders.filter(
              (loader) => loader.tier < Loader.tier && loader.isActive
            )}
            onActiveChange={() => {
              const updatedLoaders = promptLoaders.map((mod, modIndex) => {
                if (index === modIndex) {
                  const updatedLoader = { ...mod, isActive: !mod.isActive };
                  console.log(
                    `Prompt Loader ${mod.id} isActive:`,
                    updatedLoader.isActive
                  );
                  return updatedLoader;
                }
                return mod;
              });
              setPromptLoaders(updatedLoaders);
            }}
            onTaskChange={(taskName) => {
              const updatedLoaders = promptLoaders.map((mod, modIndex) => {
                if (index === modIndex) {
                  return { ...mod, taskName: taskName };
                }
                return mod;
              });
              setPromptLoaders(updatedLoaders);
              onTaskNameChange(Loader.id, taskName);
            }}
            onTierChange={(e) => {
              const updatedLoaders = promptLoaders.map((mod, modIndex) => {
                if (index === modIndex) {
                  return { ...mod, tier: e.target.value };
                }
                return mod;
              });
              setPromptLoaders(updatedLoaders);
            }}
            taskParams={taskParams}
            maxTokens={taskParams[Loader.taskName]?.max_tokens || 0}
            onTaskNameChange={handleTaskNameChange}
          />
        ))}
        {/* Button to add a new PromptLoader */}
        <button onClick={addPromptLoader}>Add Profile</button>
      </div>
    </div>
  );
}

export default App;
