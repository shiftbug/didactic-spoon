import React, { useState, useEffect, useCallback } from "react";
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
      const response = await axios.get("/api/tasks");
      console.log("Response data in App:", response.data);
      setTaskParams(response.data);
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

  const onCheckedLowerChange = useCallback(
    (id, lowerId) => {
      setPromptLoaders((prevLoaders) =>
        prevLoaders.map((loader) => {
          if (loader.id === id) {
            const lowerIndex = loader.checkedLowers.findIndex(
              (lower) => lower.id === lowerId
            );
            if (lowerIndex !== -1) {
              return {
                ...loader,
                checkedLowers: loader.checkedLowers.filter(
                  (lower) => lower.id !== lowerId
                ),
              };
            } else {
              const selectedLower = promptLoaders.find(
                (otherLoader) => otherLoader.id === lowerId
              );
              return {
                ...loader,
                checkedLowers: [...loader.checkedLowers, selectedLower],
              };
            }
          }
          return loader;
        })
      );
    },
    [promptLoaders]
  );

  const handleSubmit = useCallback(async () => {
    const activeTasks = promptLoaders.filter((loader) => loader.isActive);

    if (activeTasks.length === 0) {
      console.error("No active prompt loaders found.");
      return;
    }

    const invalidTasks = activeTasks.filter((loader) => !loader.taskName);
    if (invalidTasks.length > 0) {
      console.error("Please select a task for all active prompt loaders.");
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
      const response = await axios.post("/api/submit", {
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
            completion: completionData ? completionData.completion : "",
          };
        }
        return loader;
      });
      setPromptLoaders(updatedLoaders);
    } catch (error) {
      console.error("Error submitting loaders:", error);
    }
  }, [promptLoaders, userText]);

  const handleUserInputCheckedChange = useCallback((loaderId, e) => {
    const checked = e.target.checked;
    setPromptLoaders((prevLoaders) =>
      prevLoaders.map((loader) => {
        if (loader.id === loaderId) {
          return {
            ...loader,
            userInputChecked: checked,
          };
        }
        return loader;
      })
    );
  }, []);

  const updateTaskParams = (newTaskParams) => {
    setTaskParams(newTaskParams);
  };

  const updateAvailableTasks = (newTaskParams) => {
    setTaskParams(newTaskParams);
  };

  const handleTaskChange = (previousTaskName, updatedTasks) => {
    setPromptLoaders((prevLoaders) =>
      prevLoaders.map((loader) => {
        if (loader.taskName === previousTaskName) {
          return {
            ...loader,
            taskName: updatedTasks[loader.taskName]?.taskName || "",
          };
        }
        return loader;
      })
    );
  };

  return (
    <div className="App">
      <ProfileEditor
        className="task-m"
        onTaskParamsChange={updateAvailableTasks}
        onTaskChange={handleTaskChange}
      />
      <UserInput
        className="user-input"
        onChange={(e) => setUserText(e.target.value)}
        value={userText}
        onSubmit={handleSubmit}
      />
      <div className="prompt-loaders">
        <h2>Profile Selection</h2>
        <button className="button add-profile-button" onClick={addPromptLoader}>
          Add Profile
        </button>
        {promptLoaders.map((loader, index) => (
          <PromptLoader
            key={loader.id}
            isActive={loader.isActive}
            taskName={loader.taskName}
            onCheckedLowerChange={(lowerId) =>
              onCheckedLowerChange(loader.id, lowerId)
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
            onTierChange={(value) => {
              const updatedLoaders = promptLoaders.map(
                (otherLoader, otherIndex) => {
                  if (index === otherIndex) {
                    return {
                      ...otherLoader,
                      loaderTier: value,
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
            onUserInputCheckedChange={(e) =>
              handleUserInputCheckedChange(loader.id, e)
            }
            promptLoaders={promptLoaders}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
