import React from "react";

// Modify the BatchOrder to use the props instead of its own local state
const BatchOrder = ({ tasks, setTasks }) => {
  // State to hold the selected task
  const [selectedTask, setSelectedTask] = React.useState(null);

  // State to hold the order number
  const [orderNumber, setOrderNumber] = React.useState(null);

  // Function to handle the selection of a task
  const handleTaskSelect = (event) => {
    setSelectedTask(event.target.value);
  };

  // Function to handle the input of the order number
  const handleOrderNumberInput = (event) => {
    setOrderNumber(event.target.value);
  };

  // Function to handle the submission of the order number
  const handleOrderSubmit = () => {
    // Update the tasks state with the new order
    setTasks(
      tasks.map((task) =>
        task.id === selectedTask ? { ...task, order: orderNumber } : task
      )
    );
    // Reset the selected task and order number
    setSelectedTask(null);
    setOrderNumber(null);
  };

  return (
    <div>
      <select onChange={handleTaskSelect}>
        {tasks.map((task) => (
          <option value={task.id} key={task.id}>
            {task.name}
          </option>
        ))}
      </select>
      <input type="number" onChange={handleOrderNumberInput} />
      <button onClick={handleOrderSubmit}>Submit Order</button>
    </div>
  );
};

export default BatchOrder;
