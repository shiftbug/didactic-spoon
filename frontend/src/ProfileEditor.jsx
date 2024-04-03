import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import styles from "./ProfileEditor.module.css";
import axios from "axios";
import TaskSelector from "./TaskSelector";

const ProfileEditor = ({ onTaskParamsChange, onTaskChange }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response data in ProfileEditor:", response.data);
      setTasks(response.data);
      onTaskParamsChange(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleTaskSelection = async (taskId) => {
    console.log("Selected task ID:", taskId);
    if (taskId) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/taskparams/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Selected task configuration:", response.data);
        setSelectedTask(response.data);
      } catch (error) {
        console.error(
          `Error fetching task parameters for task ID "${taskId}":`,
          error
        );
        setSelectedTask(null);
      }
    } else {
      setSelectedTask(null);
    }
  };

  const handleTaskChange = (e, key, index, role) => {
    const { name, value, type } = e.target;
    let updatedValue = value;

    if (type === "number" || type === "range") {
      updatedValue = parseFloat(value);
    }

    setSelectedTask((prevTask) => {
      const updatedTask = { ...prevTask };

      if (key === "messages" && index !== undefined) {
        const updatedMessages = [...(updatedTask.messages || [])];
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

      return updatedTask;
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/taskparams/${selectedTask.id}`,
        selectedTask,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Task updated:", response.data);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id ? response.data : task
        )
      );
      onTaskParamsChange(response.data);
      onTaskChange(selectedTask.id, selectedTask.task_name);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleTaskNameChange = (e) => {
    const updatedTaskName = e.target.value;
    setSelectedTask((prevTask) => ({
      ...prevTask,
      task_name: updatedTaskName,
    }));
  };

  const handleAddTask = async () => {
    const newTask = {
      task_name: `NewTask_${Date.now()}`,
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

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/taskparams", newTask, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("New task created:", response.data);
      setTasks((prevTasks) => [...prevTasks, response.data]);
      setSelectedTask(response.data);
    } catch (error) {
      console.error("Error creating new task:", error);
    }
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
    <div className={styles.profileEditor}>
      <h2>Edit or Add Profiles as Needed</h2>
      <div className={styles.userInput}>
        <TaskSelector
          taskId={selectedTask ? selectedTask.id : ""}
          availableTasks={tasks}
          onTaskChange={handleTaskSelection}
        />
        <button className={styles.button} type="button" onClick={handleAddTask}>
          New Profile
        </button>
      </div>

      {selectedTask && (
        <form>
          <TextField
            className={styles.textField}
            label="Profile Name"
            value={selectedTask.task_name || ""}
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
                  {(selectedTask.messages || [])
                    .filter((message) => message.role === "system")
                    .map((message, index) => (
                      <div
                        key={`system-message-${index}`}
                        className={styles.textField}
                      >
                        <TextField
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
                  {(selectedTask.messages || [])
                    .filter((message) => message.role === "user")
                    .map((message, index) => (
                      <div
                        key={`user-message-${index}`}
                        className={styles.textField}
                      >
                        <TextField
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
                  className={styles.textField}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {isNumber && (
                    <div className={styles.slider}>
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
          <button className={styles.button} type="button" onClick={handleSave}>
            Save Profile
          </button>
        </form>
      )}
    </div>
  );
};

ProfileEditor.propTypes = {
  onTaskParamsChange: PropTypes.func.isRequired,
  onTaskChange: PropTypes.func.isRequired,
};

export default ProfileEditor;
