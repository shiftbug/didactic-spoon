import React, { useEffect, useRef } from "react";

function PromptLoader({
  onActiveChange,
  onTaskChange,
  onTierChange,
  isActive,
  taskName,
  completion,
  loaderTier,
  tierLowers,
  checkedLowers,
  onCheckedLowerChange,
  taskParams,
  maxTokens,
  userInputChecked,
  onUserInputCheckedChange,
  promptLoaders,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [completion, taskName]);

  return (
    <div className="Loader">
      <div className="Loader-header">
        <label className="toggle-Loader">
          <input type="checkbox" checked={isActive} onChange={onActiveChange} />
          Active
        </label>

        <select
          className="select"
          value={taskName}
          onChange={(e) => onTaskChange(e.target.value)}
        >
          <option value="" disabled>
            Select a Task
          </option>
          {taskParams &&
            Object.keys(taskParams).map((taskType) => (
              <option key={taskType} value={taskType}>
                {taskType}
              </option>
            ))}
        </select>

        <select className="select" value={loaderTier} onChange={onTierChange}>
          <option value="" disabled>
            Select a Tier
          </option>
          {Array.from({ length: 10 }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              Tier {index + 1}
            </option>
          ))}
        </select>

        {taskName && (
          <span className="max-tokens">Max Tokens: {maxTokens}</span>
        )}
      </div>

      <textarea
        className="Loader-output"
        ref={textareaRef}
        value={completion}
        readOnly
      />

      <div className="Loader-inputs">
        <div className="checkbox-container">
          <label>Select Inputs</label>
          <div>
            <input
              type="checkbox"
              id={`user-input-${taskName}`}
              checked={userInputChecked}
              onChange={onUserInputCheckedChange}
            />
            <label htmlFor={`user-input-${taskName}`}>User Input</label>
          </div>
          {tierLowers.map((lower) => (
            <div key={lower.id}>
              <input
                type="checkbox"
                id={`lower-tier-${lower.id}`}
                checked={checkedLowers.some(
                  (checkedLower) => checkedLower.id === lower.id
                )}
                onChange={() => onCheckedLowerChange(lower.id)}
              />
              <label htmlFor={`lower-tier-${lower.id}`}>{lower.taskName}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PromptLoader;
