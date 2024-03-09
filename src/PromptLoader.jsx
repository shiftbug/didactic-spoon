import React, { useEffect, useRef } from "react";

function PromptLoader({
  onActiveChange,
  onTaskChange,
  onTierChange,
  isActive,
  taskName,
  completion,
  tier,
  lowerTierLoaders,
  lowerTierOutputs,
  onLowerTierOutputsChange,
  taskParams,
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [completion]);

  const handleLowerTierOutputsChange = (lowerTierLoader) => {
    onLowerTierOutputsChange(lowerTierLoader);
  };

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

        <select className="select" value={tier} onChange={onTierChange}>
          <option value="" disabled>
            Select a Tier
          </option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </select>
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
          <label htmlFor="userText">
            <input
              type="checkbox"
              id="userText"
              name="userText"
              value="userText"
            />
            User Input
          </label>
          {lowerTierLoaders.map((loader) => (
            <label key={loader.id} htmlFor={loader.id}>
              <input
                type="checkbox"
                id={loader.id}
                name={loader.id}
                value={loader.id}
                checked={lowerTierOutputs.some(
                  (output) => output.id === loader.id
                )}
                onChange={() => handleLowerTierOutputsChange(loader)}
              />
              {loader.taskName}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PromptLoader;
