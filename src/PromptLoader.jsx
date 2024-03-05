import React, { useState, useEffect } from "react";

// This component handles the user interface for the prompt Loader
function PromptLoader({
  onActiveChange,
  onTaskChange,
  isActive,
  taskName,
  completion,
}) {
  // State to store the parameters for the tasks
  const [taskParams, setTaskParams] = useState({});

  // Effect hook to fetch task parameters when the component mounts
  useEffect(() => {
    // Fetching task parameters from a JSON file
    fetch("../task.json") // The path to the JSON file with task parameters
      .then((response) => response.json()) // Parsing the JSON response
      .then((data) => setTaskParams(data)); // Updating the state with the fetched data
  }, []); // Empty dependency array means this effect runs once on mount

  <option value="" disabled>
    Select a Task
  </option>;

  // Render method returns the UI for the prompt Loader
  return (
    <div className="Loader">
      <div className="Loader-header">
        {/* Toggle switch to activate or deactivate the Loader */}
        <label className="toggle-Loader">
          <input
            type="checkbox"
            checked={isActive} // The checkbox reflects the isActive state
            onChange={onActiveChange} // Calls the provided onActiveChange handler when toggled
          />{" "}
          Active
        </label>
        {/* Dropdown to select a task */}
        <select className="select" value={taskName} onChange={onTaskChange}>
          <option value="" disabled>
            Select a Task
          </option>

          {/* Maps over taskParams state to create an option for each task */}
          {taskParams &&
            Object.keys(taskParams).map((taskType) => (
              <option key={taskType} value={taskType}>
                {taskType}
              </option>
            ))}
        </select>
      </div>
      {/* Textarea to display the completion result, which is read-only */}
      <textarea
        className="Loader-output"
        rows="5"
        value={completion}
        readOnly
      />
    </div>
  );
}

// Exporting the component for use in other parts of the application
export default PromptLoader;
