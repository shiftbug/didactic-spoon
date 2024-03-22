import React, { useEffect, useRef, useMemo, useCallback } from "react";
import PropTypes from "prop-types";

function PromptLoader({
  onActiveChange,
  onTaskChange,
  onTierChange,
  isActive,
  taskName,
  completion,
  loaderTier,
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
  }, [completion]);

  const tierLowers = useMemo(() => {
    return (
      promptLoaders?.filter(
        (otherLoader) =>
          otherLoader.loaderTier < loaderTier && otherLoader.isActive
      ) || []
    );
  }, [promptLoaders, loaderTier]);

  const handleTaskChange = useCallback(
    (taskName) => {
      onTaskChange(taskName);
    },
    [onTaskChange]
  );

  const handleTierChange = useCallback(
    (e) => {
      onTierChange(parseInt(e.target.value));
    },
    [onTierChange]
  );

  return (
    <div className="Loader">
      <div className="Loader-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <select
            className="select task-select"
            value={taskName}
            onChange={(e) => handleTaskChange(e.target.value)}
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

          <select
            className="select tier-select"
            value={loaderTier}
            onChange={handleTierChange}
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
        </div>
      </div>

      <textarea
        className="Loader-output"
        ref={textareaRef}
        value={completion || ""}
        readOnly
      />

      <div className="Loader-footer">
        <div style={{ display: "flex", alignItems: "center" }}>
          <label className="toggle-Loader">
            <input
              type="checkbox"
              checked={isActive}
              onChange={onActiveChange}
              className="checkbox-input"
            />
            Active
          </label>
          {taskName && (
            <span className="max-tokens">Max Tokens: {maxTokens}</span>
          )}
          <div className="Loader-inputs">
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
                <label htmlFor={`lower-tier-${lower.id}`}>
                  {lower.taskName}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

PromptLoader.propTypes = {
  onActiveChange: PropTypes.func.isRequired,
  onTaskChange: PropTypes.func.isRequired,
  onTierChange: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  taskName: PropTypes.string.isRequired,
  completion: PropTypes.string,
  loaderTier: PropTypes.number.isRequired,
  checkedLowers: PropTypes.array.isRequired,
  onCheckedLowerChange: PropTypes.func.isRequired,
  taskParams: PropTypes.object,
  maxTokens: PropTypes.number,
  userInputChecked: PropTypes.bool.isRequired,
  onUserInputCheckedChange: PropTypes.func.isRequired,
  promptLoaders: PropTypes.array,
};

export default PromptLoader;
