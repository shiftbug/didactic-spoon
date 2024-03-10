import { useState, useEffect } from "react";
import axios from "axios";
import PromptLoader from "./PromptLoader";
import UserInput from "./UserInput";
import "./App.css";
import ProfileEditor from "./ProfileEditor";

axios.defaults.withCredentials = true;

function App() {
  const [userText, setUserText] = useState("");
  const [promptLoaders, setPromptLoaders] = useState([
    {
      id: 0,
      isActive: true,
      taskName: "",
      completion: "",
      loaderTier: 1,
      checkedLowers: [],
      userInputChecked: true,
    },
  ]);
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

  const addPromptLoader = () => {
    const newLoader = {
      id: promptLoaders.length,
      isActive: true,
      taskName: "",
      completion: "",
      loaderTier: 1,
      checkedLowers: [],
      userInputChecked: true,
    };
    setPromptLoaders([...promptLoaders, newLoader]);
  };

  const onCheckedLowerChange = (id, selectedLowerTierLoader) => {
    setPromptLoaders((prevLoaders) =>
      prevLoaders.map((loader) => {
        if (loader.id === id) {
          const lowerTierLoaderIndex = loader.checkedLowers.findIndex(
            (lower) => lower.id === selectedLowerTierLoader.id
          );
          if (lowerTierLoaderIndex !== -1) {
            return {
              ...loader,
              checkedLowers: loader.checkedLowers.filter(
                (lower) => lower.id !== selectedLowerTierLoader.id
              ),
            };
          } else {
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
      userInputChecked: loader.userInputChecked,
    }));

    console.log("Tasks sent to backend:", tasks);

    try {
      const response = await axios.post("http://127.0.0.1:5000/submit", {
        tasks: tasks,
        userText: userText,
      });

      console.log("Response from backend:", response.data);

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

  const handleUserInputCheckedChange = (loaderId, checked) => {
    // If 'checked' is an event, extract the checked value, otherwise use it directly
    const isChecked = checked.target ? checked.target.checked : checked;
    setPromptLoaders((prevLoaders) =>
      prevLoaders.map((loader) => {
        if (loader.id === loaderId) {
          return {
            ...loader,
            userInputChecked: isChecked,
          };
        }
        return loader;
      })
    );
  };

  return (
    <div className="App">
      <ProfileEditor className="task-m" />
      <UserInput
        className="user-input"
        onChange={(e) => setUserText(e.target.value)}
        value={userText}
        onSubmit={handleSubmit}
      />
      <div className="prompt-loaders">
        <h2>Profile Selection</h2>
        <button onClick={addPromptLoader}>Add Profile</button>
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
                    return {
                      ...otherLoader,
                      isActive: !otherLoader.isActive,
                    };
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
                    return {
                      ...otherLoader,
                      taskName: taskName,
                    };
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
                    return {
                      ...otherLoader,
                      loaderTier: parseInt(e.target.value),
                    };
                  }
                  return otherLoader;
                }
              );
              setPromptLoaders(updatedLoaders);
            }}
            taskParams={taskParams}
            maxTokens={taskParams[loader.taskName]?.max_tokens || 0}
            userInputChecked={loader.userInputChecked}
            onUserInputCheckedChange={(checked) =>
              handleUserInputCheckedChange(loader.id, checked)
            }
          />
        ))}
      </div>
    </div>
  );
}

export default App;
