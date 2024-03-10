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
      loaderTier: 1,
      checkedLowers: [],
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
      loaderTier: 1,
      checkedLowers: [],
    };
    setPromptLoaders([...promptLoaders, newLoader]);
    console.log("New prompt loader added:", newLoader); // Debugging
  };

  const onCheckedLowerChange = (id, selectedLowerTierLoader) => {
    setPromptLoaders((prevLoaders) =>
      prevLoaders.map((loader) => {
        if (loader.id === id) {
          const lowerTierLoaderIndex = loader.checkedLowers.findIndex(
            (lower) => lower.id === selectedLowerTierLoader.id
          );
          if (lowerTierLoaderIndex !== -1) {
            // Remove the lower tier loader if it exists
            console.log(
              `Removing lower tier loader ${selectedLowerTierLoader.id} from prompt loader ${id}`
            ); // Debugging
            return {
              ...loader,
              checkedLowers: loader.checkedLowers.filter(
                (lower) => lower.id !== selectedLowerTierLoader.id
              ),
            };
          } else {
            // Add the lower tier loader if it doesn't exist
            console.log(
              `Adding lower tier loader ${selectedLowerTierLoader.id} to prompt loader ${id}`
            ); // Debugging
            return {
              ...loader,
              checkedLowers: [...loader.checkedLowers, selectedLowerTierLoader],
            };
          }
        }
        return loader;
      })
    );
  };

  const handleSubmit = async () => {
    const activeTasks = promptLoaders.filter((loader) => loader.isActive);

    if (activeTasks.length === 0) {
      console.error("No active prompt loaders found.");
      return;
    }

    const tasks = activeTasks.map((loader) => ({
      instance_id: loader.id,
      taskName: loader.taskName,
      tier: loader.loaderTier,
      lowerTierLoaders: loader.checkedLowers.map((lower) => ({
        instance_id: lower.id,
        taskName: lower.taskName,
      })),
    }));

    console.log("Tasks sent to backend:", tasks); // Debugging

    try {
      const response = await axios.post("http://127.0.0.1:5000/submit", {
        tasks: tasks,
        userText: userText,
      });

      console.log("Response from backend:", response.data); // Debugging

      const updatedLoaders = promptLoaders.map((loader) => {
        if (loader.isActive) {
          const completionData = response.data.completions.find(
            (completion) => completion.instance_id === loader.id
          );
          return {
            ...loader,
            completion: completionData
              ? completionData.completion
              : "No completion received.",
          };
        }
        return loader;
      });
      setPromptLoaders(updatedLoaders);
    } catch (error) {
      console.error("Error submitting loaders:", error);
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
      <div className="prompt-loaders">
        <h2>Profile Selection</h2>
        {promptLoaders.map((loader, index) => (
          <PromptLoader
            key={loader.id}
            isActive={loader.isActive}
            taskName={loader.taskName}
            onCheckedLowerChange={(lowerTierLoader) =>
              onCheckedLowerChange(loader.id, lowerTierLoader)
            }
            completion={loader.completion}
            loaderTier={loader.loaderTier}
            checkedLowers={loader.checkedLowers}
            tierLowers={promptLoaders.filter(
              (otherLoader) =>
                otherLoader.loaderTier < loader.loaderTier &&
                otherLoader.isActive
            )}
            onActiveChange={() => {
              const updatedLoaders = promptLoaders.map(
                (otherLoader, otherIndex) => {
                  if (index === otherIndex) {
                    const updatedLoader = {
                      ...otherLoader,
                      isActive: !otherLoader.isActive,
                    };
                    console.log(
                      `Prompt Loader ${otherLoader.id} isActive:`,
                      updatedLoader.isActive
                    ); // Debugging
                    return updatedLoader;
                  }
                  return otherLoader;
                }
              );
              setPromptLoaders(updatedLoaders);
            }}
            onTaskChange={(taskName) => {
              const updatedLoaders = promptLoaders.map(
                (otherLoader, otherIndex) => {
                  if (index === otherIndex) {
                    const updatedLoader = {
                      ...otherLoader,
                      taskName: taskName,
                    };

                    console.log(
                      `Task name changed for prompt loader ${otherLoader.id}:`,
                      taskName
                    ); // Debugging

                    return updatedLoader;
                  }
                  return otherLoader;
                }
              );

              const updatedLoadersWithCheckedLowers = updatedLoaders.map(
                (loader) => {
                  const updatedCheckedLowers = loader.checkedLowers.map(
                    (checkedLower) => {
                      const matchingLoader = updatedLoaders.find(
                        (otherLoader) => otherLoader.id === checkedLower.id
                      );
                      if (matchingLoader) {
                        return {
                          ...checkedLower,
                          taskName: matchingLoader.taskName,
                        };
                      }
                      return checkedLower;
                    }
                  );

                  return {
                    ...loader,
                    checkedLowers: updatedCheckedLowers,
                  };
                }
              );

              setPromptLoaders(updatedLoadersWithCheckedLowers);
            }}
            onTierChange={(e) => {
              const updatedLoaders = promptLoaders.map(
                (otherLoader, otherIndex) => {
                  if (index === otherIndex) {
                    const updatedLoader = {
                      ...otherLoader,
                      loaderTier: parseInt(e.target.value),
                    };
                    console.log(
                      `Tier changed for prompt loader ${otherLoader.id}:`,
                      e.target.value
                    ); // Debugging
                    return updatedLoader;
                  }
                  return otherLoader;
                }
              );
              setPromptLoaders(updatedLoaders);
            }}
            taskParams={taskParams}
            maxTokens={taskParams[loader.taskName]?.max_tokens || 0}
          />
        ))}
        {/* Button to add a new PromptLoader */}
        <button onClick={addPromptLoader}>Add Profile</button>
      </div>
    </div>
  );
}

export default App;
