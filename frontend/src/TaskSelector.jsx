import React from "react";
import PropTypes from "prop-types";

const TaskSelector = ({ taskId, availableTasks, onTaskChange }) => (
  <select value={taskId || ""} onChange={(e) => onTaskChange(e.target.value)}>
    <option value="" disabled>
      Select a Task
    </option>
    {Array.isArray(availableTasks) &&
      availableTasks.map((task) => (
        <option key={task.id} value={task.id}>
          {task.task_name}
        </option>
      ))}
  </select>
);

TaskSelector.propTypes = {
  taskId: PropTypes.string,
  availableTasks: PropTypes.array,
  onTaskChange: PropTypes.func.isRequired,
};

export default TaskSelector;
