import React from "react";
import PropTypes from "prop-types";
import styles from "./PromptLoader.module.css";
import TaskSelector from "./TaskSelector";

function PromptLoader({
  id,
  taskId,
  taskName,
  isActive,
  completion,
  loaderTier,
  checkedLowers,
  userInputChecked,
  onActiveChange,
  onRemove,
  onCheckedLowerChange,
  onUserInputCheckedChange,
  availableTasks,
  userText,
  maxTokens,
  onTaskChange,
  handleTierChange,
  promptLoaders, //
}) {
  const tierLowers = promptLoaders.filter(
    (loader) => loader.loaderTier < loaderTier && loader.isActive
  );

  return (
    <div className={styles.promptLoader}>
      <div className={styles.header}>
        <h3>{taskName}</h3>
        <button className={styles.removeButton} onClick={onRemove}>
          Remove
        </button>
      </div>
      <div className={styles.content}>
        <textarea className={styles.completion} value={completion} readOnly />
        <div className={styles.settings}>
          <label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={onActiveChange}
            />
            Active
          </label>
          <label>
            Task:
            <TaskSelector
              taskId={selectedTask ? selectedTask.id : ""}
              availableTasks={tasks}
              onTaskChange={handleTaskSelection}
            />
          </label>
          <label>
            Tier:
            <select
              value={loaderTier}
              onChange={(e) =>
                handleTierChange(id, Number(e.target.value), availableTasks)
              }
            >
              <option value="" disabled>
                Select a Tier
              </option>
              {Array.from({ length: 10 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  Tier {index + 1}
                </option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={userInputChecked}
              onChange={onUserInputCheckedChange}
            />
            User Input
          </label>
          <div>
            Lower Tiers:
            {tierLowers.map((lower) => (
              <label key={lower.id}>
                <input
                  type="checkbox"
                  checked={checkedLowers.includes(lower.id)}
                  onChange={() => onCheckedLowerChange(lower.id)}
                />
                {lower.taskName}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <p>Max Tokens: {maxTokens}</p>
      </div>
    </div>
  );
}

PromptLoader.propTypes = {
  id: PropTypes.number.isRequired,
  taskId: PropTypes.number,
  taskName: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  completion: PropTypes.string.isRequired,
  loaderTier: PropTypes.number.isRequired,
  checkedLowers: PropTypes.arrayOf(PropTypes.number).isRequired,
  userInputChecked: PropTypes.bool.isRequired,
  onActiveChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onCheckedLowerChange: PropTypes.func.isRequired,
  onUserInputCheckedChange: PropTypes.func.isRequired,
  availableTasks: PropTypes.array.isRequired,
  userText: PropTypes.string.isRequired,
  maxTokens: PropTypes.number.isRequired,
  onTaskChange: PropTypes.func.isRequired,
  handleTierChange: PropTypes.func.isRequired,
  promptLoaders: PropTypes.array.isRequired,
};

export default PromptLoader;
