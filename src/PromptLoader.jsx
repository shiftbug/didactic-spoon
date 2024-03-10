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
}) {
  // Reference to the textarea element
  const textareaRef = useRef(null);

  // Use effect hook to adjust the height of the textarea based on its content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [completion, taskName]);

  return (
    <div className="Loader">
      <div className="Loader-header">
        {/* Checkbox to toggle the active state */}
        <label className="toggle-Loader">
          <input type="checkbox" checked={isActive} onChange={onActiveChange} />
          Active
        </label>

        {/* Dropdown to select the task */}
        <select
          className="select"
          value={taskName}
          onChange={(e) => onTaskChange(e.target.value)}
        >
          <option value="" disabled>
            Select a Task
          </option>
          {/* Render task options based on taskParams */}
          {taskParams &&
            Object.keys(taskParams).map((taskType) => (
              <option key={taskType} value={taskType}>
                {taskType}
              </option>
            ))}
        </select>

        {/* Dropdown to select the tier */}
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

        {/* Display the maximum tokens for the selected task */}
        {taskName && (
          <span className="max-tokens">Max Tokens: {maxTokens}</span>
        )}
      </div>

      {/* Textarea to display the completion */}
      <textarea
        className="Loader-output"
        ref={textareaRef}
        value={completion}
        readOnly
      />

      <div className="Loader-inputs">
        <div className="checkbox-container">
          <label htmlFor={`user-input-${taskName}`}>Select Inputs</label>
          <div>
            <input
              type="checkbox"
              id={`user-input-${taskName}`}
              checked={userInputChecked}
              onChange={onUserInputCheckedChange}
            />
            <label htmlFor={`user-input-${taskName}`}>User Input</label>
          </div>
          {/* Render checkboxes for tierLowers */}
          {tierLowers.map((lower) => (
            <div key={lower.id}>
              <input
                type="checkbox"
                id={`lower-tier-${lower.id}`}
                value={lower.id}
                checked={checkedLowers.some(
                  (checkedLower) => checkedLower.id === lower.id
                )}
                onChange={() => onCheckedLowerChange(lower)}
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
