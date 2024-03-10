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
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => {
              onActiveChange();
              console.log(
                `Prompt loader ${taskName} active state changed:`,
                !isActive
              ); // Debugging
            }}
          />
          Active
        </label>

        {/* Dropdown to select the task */}
        <select
          className="select"
          value={taskName}
          onChange={(e) => {
            onTaskChange(e.target.value);
            console.log(`Task changed for prompt loader:`, e.target.value); // Debugging
          }}
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
        <select
          className="select"
          value={loaderTier}
          onChange={(e) => {
            onTierChange(e);
            console.log(
              `Tier changed for prompt loader ${taskName}:`,
              e.target.value
            ); // Debugging
          }}
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
          <label>Select Inputs</label>
          {/* Checkbox for user input */}
          <label htmlFor="userText">
            <input
              type="checkbox"
              id="userText"
              name="userText"
              value="userText"
            />
            User Input
          </label>
          {/* Render checkboxes for tierLowers */}
          {tierLowers.map((lower) => (
            <label key={lower.id} htmlFor={lower.id}>
              <input
                type="checkbox"
                id={lower.id}
                name={lower.id}
                value={lower.id}
                checked={checkedLowers.some(
                  (checkedLower) => checkedLower.id === lower.id
                )}
                onChange={() => onCheckedLowerChange(lower)}
              />
              {lower.taskName}
            </label>
          ))}
        </div>
      </div>
      {console.log("PromptLoader rendered for task:", taskName)}{" "}
      {/* Debugging */}
    </div>
  );
}

export default PromptLoader;
