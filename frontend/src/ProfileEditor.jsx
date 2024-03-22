import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import "./App.css";

const ProfileEditor = ({ onTaskParamsChange, onTaskChange }) => {
  const [tasks, setTasks] = useState({});
  const [selectedTaskName, setSelectedTaskName] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios
      .get("/api/tasks")
      .then((response) => {
        console.log("Response data in ProfileEditor:", response.data);
        setTasks(response.data);
        onTaskParamsChange(response.data);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  };

  const handleTaskSelection = (e) => {
    const taskName = e.target.value;
    setSelectedTaskName(taskName);
    setSelectedTask(tasks[taskName]);
  };

  const handleTaskChange = (e, key, index, role) => {
    const { name, value, type } = e.target;
    let updatedValue = value;

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
    onTaskChange(selectedTaskName, {
      ...tasks,
      [selectedTaskName]: updatedTask,
    });
  };

  const handleSave = () => {
    setTasks((prevTasks) => ({
      ...prevTasks,
      [setSelectedTaskName]: selectedTaskName,
    }));

    axios
      .post("/api/tasks", {
        ...tasks,
        [selectedTaskName]: selectedTask,
      })
      .then((response) => {
        console.log("Tasks updated:", response.data);
        setSelectedTask(null);
        setSelectedTaskName("");
        fetchTasks();
        onTaskParamsChange(response.data); // Update available tasks in App.jsx
      })
      .catch((error) => {
        console.error("Error updating tasks:", error);
      });
  };

  const handleTaskNameChange = (e) => {
    const newTaskName = e.target.value;
    const updatedTasks = { ...tasks };
    updatedTasks[newTaskName] = { ...selectedTask };
    delete updatedTasks[selectedTaskName];

    setTasks(updatedTasks);
    setSelectedTaskName(newTaskName);
  };

  const handleAddTask = () => {
    const newTaskName = `NewTask_${Date.now()}`;
    const newTask = {
      model: "ollama-nous-hermes2-mixtral",
      max_tokens: 500,
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: "<<user_input>>, context if any: <<completions>>",
        },
      ],
    };

    setTasks((prevTasks) => ({ ...prevTasks, [newTaskName]: newTask }));
    setSelectedTaskName(newTaskName);
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
    <div className="profile-editor">
      <h2>Profile Editor</h2>
      <div className="user-input">
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
            className="text-field"
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
                          className="text-field"
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
                          className="text-field"
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
                    <div className="slider">
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
                      />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <TextField
                      className="text-field"
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
