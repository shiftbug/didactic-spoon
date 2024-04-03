import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import ProfileEditor from "./ProfileEditor";
import UserInput from "./UserInput";
import TaskList from "./TaskList";
import usePromptLoaders from "./hooks/usePromptLoaders";
import useTaskParams from "./hooks/useTaskParams";
import AuthContext from "./AuthContext";
import styles from "./MainApp.module.css";

function MainApp() {
  const { token } = useContext(AuthContext);
  const [userText, setUserText] = useState("");
  const [
    promptLoaders,
    addPromptLoader,
    updatePromptLoader,
    removePromptLoader,
    handleTaskSelection,
    handleTierChange,
  ] = usePromptLoaders();
  const [availableTasks, setAvailableTasks] = useTaskParams();
  const [maxTokens, setMaxTokens] = useState({});

  useEffect(() => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, [token]);

  const handleMaxTokensChange = (loaderId, newMaxTokens) => {
    setMaxTokens((prevMaxTokens) => ({
      ...prevMaxTokens,
      [loaderId]: newMaxTokens,
    }));
  };

  const handleSubmit = async () => {
    try {
      const activeTasks = promptLoaders.filter((loader) => loader.isActive);
      const invalidTasks = activeTasks.filter((loader) => !loader.taskName);

      if (invalidTasks.length > 0) {
        throw new Error("Please select a task for all active prompt loaders.");
      }

      const tasks = activeTasks.map((loader) => ({
        instance_id: loader.id,
        task_id: loader.taskId,
        taskName: loader.taskName,
        tier: loader.loaderTier,
        lowerTierLoaders: loader.checkedLowers.map((lower) => ({
          instance_id: lower.id,
          task_id: lower.taskId,
          taskName: lower.taskName,
        })),
        userInputChecked: loader.userInputChecked,
      }));

      const response = await axios.post("/api/submit", { tasks, userText });
      const completions = response.data.completions;

      const updatedLoaders = promptLoaders.map((loader) => {
        if (loader.isActive) {
          const completion = completions.find(
            (c) => c.instance_id === loader.id
          );
          return {
            ...loader,
            completion: completion ? completion.completion : "",
          };
        }
        return loader;
      });

      updatePromptLoader(updatedLoaders);
    } catch (error) {
      console.error("Error submitting tasks:", error);
    }
  };

  return (
    <div className={styles.app}>
      <ProfileEditor
        onTaskParamsChange={setAvailableTasks}
        onTaskChange={updatePromptLoader}
      />
      <UserInput
        text={userText}
        onTextChange={setUserText}
        onSubmit={handleSubmit}
      />
      <TaskList
        promptLoaders={promptLoaders}
        onAddPromptLoader={addPromptLoader}
        onUpdatePromptLoader={updatePromptLoader}
        onRemovePromptLoader={removePromptLoader}
        availableTasks={availableTasks}
        userText={userText}
        handleTaskSelection={handleTaskSelection}
        handleTierChange={handleTierChange}
        onMaxTokensChange={handleMaxTokensChange}
        maxTokens={maxTokens}
      />
    </div>
  );
}

export default MainApp;
