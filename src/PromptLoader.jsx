import React, { useState, useEffect } from "react";

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
}) {
  const [taskParams, setTaskParams] = useState({});

  useEffect(() => {
    fetch("../task.json")
      .then((response) => response.json())
      .then((data) => setTaskParams(data));
  }, []);

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

        <select className="select" value={taskName} onChange={onTaskChange}>
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
        rows="5"
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
