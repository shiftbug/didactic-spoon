import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import "./App.css";

const ProfileEditor = () => {
  const [tasks, setTasks] = useState({});
  const [selectedTaskName, setSelectedTaskName] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/tasks")
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  const handleTaskSelection = (e) => {
    const taskName = e.target.value;
    setSelectedTaskName(taskName);
    setSelectedTask(tasks[taskName]);
  };

  const handleTaskChange = (e, key, index, role) => {
    const { name, value, type } = e.target;
    let updatedValue = value;

    // Parse the value as a float if the input type is 'number' or 'range'
    if (type === "number" || type === "range") {
      updatedValue = parseFloat(value);
    }

    const updatedTask = { ...selectedTask };

    if (key === "messages" && index !== undefined) {
      const updatedMessages = [...updatedTask.messages];
      const messageIndex = updatedMessages.findIndex(
        (message) => message.role === role
      );
      if (messageIndex !== -1) {
        updatedMessages[messageIndex].content = updatedValue;
        updatedTask.messages = updatedMessages;
      }
    } else {
      updatedTask[name] = updatedValue;
    }

    setSelectedTask(updatedTask);
    setTasks({ ...tasks, [selectedTaskName]: updatedTask });
  };

  const handleSave = () => {
    // Post the current state of tasks to the server endpoint
    axios
      .post("http://127.0.0.1:5000/tasks", tasks)
      .then((response) => {
        // Log the server's response upon successful update
        console.log("Tasks updated:", response.data);
        // Reset selected task and name to hide the settings panel
        setSelectedTask(null);
        setSelectedTaskName("");
      })
      .catch((error) => {
        // Log an error if the update fails
        console.error("Error updating tasks:", error);
      });
  };

  const handleTaskNameChange = (e) => {
    const newTaskName = e.target.value;
    const updatedTasks = { ...tasks };
    delete updatedTasks[selectedTaskName];
    updatedTasks[newTaskName] = selectedTask;

    setTasks(updatedTasks);
    setSelectedTaskName(newTaskName);
  };

  const handleAddTask = () => {
    const exampleTask = tasks["Example"]; // Assuming 'Example' is a key in your tasks object
    if (!exampleTask) {
      console.error("Example task not found.");
      return;
    }

    const newTaskName = `NewTask_${Date.now()}`; // Generate a unique task name
    const newTask = { ...exampleTask }; // Create a copy of the example task

    // Update the tasks state with the new task
    setTasks({ ...tasks, [newTaskName]: newTask });
    setSelectedTaskName(newTaskName); // Select the new task for editing
    setSelectedTask(newTask);
  };

  const fieldOrder = [
    "model",
    "max_tokens",
    "temperature",
    "top_p",
    "frequency_penalty",
    "presence_penalty",
    "messages",
  ];

  return (
    <div>
      <h2>Profile Editor</h2>
      <div
        className="user-input"
        style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}
      >
        <select
          className="select"
          onChange={handleTaskSelection}
          value={selectedTaskName || ""}
        >
          <option value="">Edit a Profile</option>
          {Object.keys(tasks).map((taskName) => (
            <option key={taskName} value={taskName}>
              {taskName}
            </option>
          ))}
        </select>
        <button className="button" type="button" onClick={handleAddTask}>
          New Profile
        </button>
      </div>

      {selectedTask && (
        <form>
          <TextField
            InputLabelProps={{ style: { color: "lightgray" } }}
            InputProps={{
              style: {
                color: "lightgray",
                height: "40px",
                padding: "0 14px",
                fontSize: "0.875rem",
              },
            }}
            label="Profile Name"
            value={selectedTaskName || ""}
            onChange={handleTaskNameChange}
            variant="outlined"
            fullWidth
            margin="dense"
          />
          {fieldOrder.map((key) => {
            const value = selectedTask[key];
            if (key === "messages") {
              return (
                <div key={key}>
                  {value
                    .filter((message) => message.role === "system")
                    .map((message, index) => (
                      <div
                        key={`system-message-${index}`}
                        style={{ width: "100%" }}
                      >
                        <TextField
                          InputLabelProps={{ style: { color: "lightgray" } }}
                          InputProps={{
                            style: {
                              color: "lightgray",
                              height: "auto",
                              padding: "14px",
                              fontSize: "1rem",
                            },
                          }}
                          label="System Message"
                          name={`system-message-${index}`}
                          value={message.content || ""}
                          onChange={(e) =>
                            handleTaskChange(e, key, index, "system")
                          }
                          variant="outlined"
                          fullWidth
                          margin="dense"
                          multiline
                          rows={4}
                        />
                      </div>
                    ))}
                  {value
                    .filter((message) => message.role === "user")
                    .map((message, index) => (
                      <div
                        key={`user-message-${index}`}
                        style={{ width: "100%" }}
                      >
                        <TextField
                          InputLabelProps={{ style: { color: "lightgray" } }}
                          InputProps={{
                            style: {
                              color: "lightgray",
                              height: "auto",
                              padding: "14px",
                              fontSize: "1rem",
                            },
                          }}
                          label="User Message"
                          name={`user-message-${index}`}
                          value={message.content || ""}
                          onChange={(e) =>
                            handleTaskChange(e, key, index, "user")
                          }
                          variant="outlined"
                          fullWidth
                          margin="dense"
                          multiline
                          rows={4}
                        />
                      </div>
                    ))}
                </div>
              );
            } else {
              const isNumber = typeof value === "number";
              let minVal = 0;
              let maxVal = 1;
              let stepVal = 0.1;

              if (key === "max_tokens") {
                maxVal = 4096;
                stepVal = 1;
              } else if (
                key === "temperature" ||
                key === "frequency_penalty" ||
                key === "presence_penalty"
              ) {
                maxVal = 2;
                stepVal = 0.01;
              }

              return (
                <div
                  key={key}
                  style={{
                    marginBottom: "5px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {isNumber && (
                    <div
                      style={{
                        width: "200px",
                        marginRight: "100px",
                        marginLeft: "100px",
                      }}
                    >
                      <Slider
                        value={typeof value === "number" ? value : minVal}
                        onChange={(e, newValue) =>
                          handleTaskChange(
                            {
                              target: {
                                name: key,
                                value: newValue,
                                type: "number",
                              },
                            },
                            key
                          )
                        }
                        aria-labelledby="input-slider"
                        step={stepVal}
                        min={minVal}
                        max={maxVal}
                        style={{ color: "lightgray" }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <TextField
                      InputLabelProps={{ style: { color: "lightgray" } }}
                      InputProps={{
                        style: {
                          color: "lightgray",
                          height: "40px",
                          padding: "0 14px",
                          fontSize: "0.875rem",
                        },
                      }}
                      label={key
                        .replace(/_/g, " ")
                        .replace(/^\w/, (c) => c.toUpperCase())}
                      type={isNumber ? "number" : "text"}
                      name={key}
                      value={value}
                      onChange={(e) => handleTaskChange(e, key)}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      inputProps={{
                        step: stepVal,
                        min: minVal,
                        max: maxVal,
                      }}
                    />
                  </div>
                </div>
              );
            }
          })}
          <button className="button" type="button" onClick={handleSave}>
            Save Profile
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfileEditor;
