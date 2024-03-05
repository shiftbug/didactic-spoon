// Import necessary components
import React from "react";
import axios from "axios";

const BatchManager = ({ tasks, setTasks, batches, setBatches }) => {
  // Function to determine the order of the batches and dependencies between tasks
  const manageDependencies = async () => {
    // Sort the tasks based on their order property
    const orderedTasks = tasks.sort((a, b) => a.order - b.order);

    // Group the tasks into batches based on their dependencies
    // This is a simplified example. The actual grouping logic would depend on how you define dependencies
    let batch = [];
    let prevTask = null;
    for (const task of orderedTasks) {
      if (!prevTask || task.dependsOn === prevTask.id) {
        batch.push(task);
      } else {
        batches.push(batch);
        batch = [task];
      }
      prevTask = task;
    }
    if (batch.length) {
      batches.push(batch);
    }

    setBatches(batches);
  };

  // Function to handle the submission of each batch to the backend
  const handleBatchSubmit = async (batch) => {
    // Get only the active engines from the batch, their task names, and their instance IDs
    const batchTasks = batch
      .filter((engine) => engine.isActive)
      .map((engine) => ({
        instance_id: engine.id,
        taskName: engine.taskName,
      }));

    // Send the active task names, instance IDs, and user text to the backend
    try {
      const response = await axios.post("<http://127.0.0.1:5000/submit>", {
        tasks: batchTasks,
        userText: userText,
      });

      console.log("Response data:", response.data); // Log the response data

      // Update the batch with the completions received from the backend
      const updatedBatch = batch.map((engine) => {
        if (engine.isActive) {
          const completionData = response.data.completions.find(
            (completion) => completion.instance_id === engine.id
          );
          return {
            ...engine,
            completion: completionData
              ? completionData.completion
              : "No completion received.",
          };
        }
        return engine;
      });
      console.log(updatedBatch); // Add this line to log the updated batch

      // Update the batches state with the updated batch
      setBatches(batches.map((b) => (b === batch ? updatedBatch : b)));
    } catch (error) {
      console.error("Error submitting Batch:", error);
      // Error handling should be implemented here
    }
  };

  // Logic to manage and submit batches goes here
};

export default BatchManager;
