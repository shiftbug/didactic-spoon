// TaskList.jsx
import React from "react";
import PropTypes from "prop-types";
import PromptLoader from "./PromptLoader";
import styles from "./TaskList.module.css";

function TaskList({
  promptLoaders,
  onAddPromptLoader,
  onUpdatePromptLoader,
  onRemovePromptLoader,
  taskParams,
  userText,
  onMaxTokensChange,
  maxTokens,
}) {
  if (!Array.isArray(promptLoaders)) {
    console.error("promptLoaders is not an array:", promptLoaders);
    return null;
  }

  return (
    <div className={styles.taskList}>
      <h2>Choose Profiles to Guide Your Transformations</h2>
      <button className={styles.addButton} onClick={onAddPromptLoader}>
        Add Output
      </button>
      {promptLoaders.map((loader) => (
        <PromptLoader
          key={loader.id}
          {...loader}
          onActiveChange={() =>
            onUpdatePromptLoader(toggleLoaderActive(loader.id))
          }
          onTaskChange={(taskId) =>
            onUpdatePromptLoader(updateLoaderTask(loader.id, taskId))
          }
          onTierChange={(tier) =>
            onUpdatePromptLoader(updateLoaderTier(loader.id, tier))
          }
          onCheckedLowerChange={(lowerId) =>
            onUpdatePromptLoader(toggleLoaderLower(loader.id, lowerId))
          }
          onUserInputCheckedChange={() =>
            onUpdatePromptLoader(toggleLoaderUserInput(loader.id))
          }
          taskParams={taskParams}
          promptLoaders={promptLoaders}
          userText={userText}
          onRemove={() => onRemovePromptLoader(loader.id)}
          onMaxTokensChange={(newMaxTokens) =>
            onMaxTokensChange(loader.id, newMaxTokens)
          }
          maxTokens={maxTokens[loader.id] || 0}
        />
      ))}
    </div>
  );
}

TaskList.propTypes = {
  promptLoaders: PropTypes.array.isRequired,
  onAddPromptLoader: PropTypes.func.isRequired,
  onUpdatePromptLoader: PropTypes.func.isRequired,
  onRemovePromptLoader: PropTypes.func.isRequired,
  taskParams: PropTypes.object.isRequired,
  userText: PropTypes.string.isRequired,
  onMaxTokensChange: PropTypes.func.isRequired,
  maxTokens: PropTypes.object.isRequired,
};

// Helper functions for updating prompt loaders
const toggleLoaderActive = (id) => (loaders) =>
  loaders.map((loader) =>
    loader.id === id ? { ...loader, isActive: !loader.isActive } : loader
  );

const updateLoaderTask = (id, taskId) => (loaders) =>
  loaders.map((loader) =>
    loader.id === id
      ? { ...loader, taskId, taskName: getTaskName(taskId, taskParams) }
      : loader
  );

const updateLoaderTier = (id, tier) => (loaders) =>
  loaders.map((loader) =>
    loader.id === id ? { ...loader, loaderTier: tier } : loader
  );

const toggleLoaderLower = (id, lowerId) => (loaders) =>
  loaders.map((loader) =>
    loader.id === id
      ? {
          ...loader,
          checkedLowers: loader.checkedLowers.includes(lowerId)
            ? loader.checkedLowers.filter((l) => l !== lowerId)
            : [...loader.checkedLowers, lowerId],
        }
      : loader
  );

const toggleLoaderUserInput = (id) => (loaders) =>
  loaders.map((loader) =>
    loader.id === id
      ? { ...loader, userInputChecked: !loader.userInputChecked }
      : loader
  );

const getTaskName = (taskId, taskParams) => taskParams[taskId]?.task_name || "";

export default TaskList;
