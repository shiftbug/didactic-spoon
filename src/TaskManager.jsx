import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import './App.css';

const TaskManager = () => {
  const [tasks, setTasks] = useState({});
  const [selectedTaskName, setSelectedTaskName] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/tasks')
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => console.error('Error fetching tasks:', error));
  }, []);

  const handleTaskSelection = (e) => {
    const taskName = e.target.value;
    setSelectedTaskName(taskName);
    setSelectedTask(tasks[taskName]);
  };

  const handleTaskChange = (e, key, index) => {
    const { name, value, type } = e.target;
    let updatedValue = value;
  
    // Parse the value as a float if the input type is 'number' or 'range'
    if (type === 'number' || type === 'range') {
      updatedValue = parseFloat(value);
    }
  
    const updatedTask = { ...selectedTask };
  
    if (key === 'messages' && index !== undefined) {
      const updatedMessages = [...updatedTask.messages];
      if (updatedMessages[index].role === 'system') {
        updatedMessages[index].content = updatedValue;
        updatedTask.messages = updatedMessages;
      }
    } else {
      updatedTask[name] = updatedValue;
    }
  
    setSelectedTask(updatedTask);
    setTasks({ ...tasks, [selectedTaskName]: updatedTask });
  };

  const handleSave = () => {
    axios.post('http://127.0.0.1:5000/tasks', tasks)
      .then(response => console.log('Tasks updated:', response.data))
      .catch(error => console.error('Error updating tasks:', error));
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
    const exampleTask = tasks['Example']; // Assuming 'Example' is a key in your tasks object
    if (!exampleTask) {
      console.error('Example task not found.');
      return;
    }
  
    const newTaskName = `NewTask_${Date.now()}`; // Generate a unique task name
    const newTask = { ...exampleTask }; // Create a copy of the example task
  
    // Update the tasks state with the new task
    setTasks({ ...tasks, [newTaskName]: newTask });
    setSelectedTaskName(newTaskName); // Select the new task for editing
    setSelectedTask(newTask);
  };
  
  return (
    <div>
      <h2>Task Manager</h2>
      <div className="engine-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <select className="select" onChange={handleTaskSelection} value={selectedTaskName || ''}>
          <option value="">Select a task</option>
          {Object.keys(tasks).map(taskName => (
            <option key={taskName} value={taskName}>{taskName}</option>
          ))}
        </select>
        <button  className="button" type="button" onClick={handleAddTask}>Add Task</button>
      </div>
      
      {selectedTask && (
        <form>
          <TextField
            InputProps={{ style: { color: 'lightgray' }}}
            label="Task Name"
            value={selectedTaskName || ''}
            onChange={handleTaskNameChange}
            variant="outlined"
            fullWidth
            margin="normal"
          />
                  {Object.entries(selectedTask).map(([key, value]) => {
            if (key === 'messages') {
              return value.filter(message => message.role === 'system').map((message, index) => (
                <div key={`message-${index}`}>
                  <TextField
                    InputProps={{ style: { color: 'lightgray' }}}
                    label={`System Message`}
                    name={`${key}-${index}`}
                    value={message.content || ''}
                    onChange={(e) => handleTaskChange(e, key, index)}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                </div>
              ));
            } else {
                const isNumber = typeof value === 'number';
                const isMaxTokens = key === 'max_tokens';
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ marginRight: '10px' }}>{key}</label>
                    {isNumber && !isMaxTokens && (
                      <>
                        <Tooltip title={`Adjust ${key}`} placement="top">
                          <input
                            InputProps={{ style: { color: 'lightgray' }}}
                            type="range"
                            name={key}
                            value={value}
                            onChange={(e) => handleTaskChange(e, key)}
                            min={0}
                            max={1}
                            step={0.1}
                            style={{ marginRight: '10px' }}
                          />
                        </Tooltip>
                        <TextField
                          InputProps={{ style: { color: 'lightgray' }}}
                          type="number"
                          name={key}
                          value={value}
                          onChange={(e) => handleTaskChange(e, key)}
                          inputProps={{ step: 0.1, min: 0, max: 1 }}
                          variant="outlined"
                          size="small"
                          style={{ width: '80px' }}
                        />
                      </>
                    )}
                    {isNumber && isMaxTokens && (
                      <TextField
                        InputProps={{ style: { color: 'lightgray' }}}
                        type="number"
                        name={key}
                        value={value}
                        onChange={(e) => handleTaskChange(e, key)}
                        inputProps={{ step: 1, min: 0 }}
                        variant="outlined"
                        size="small"
                        style={{ width: '120px' }}
                      />
                    )}
                    {!isNumber && (
                      <TextField
                        InputProps={{ style: { color: 'lightgray' }}}
                        type="text"
                        name={key}
                        value={value || ''}
                        onChange={(e) => handleTaskChange(e, key)}
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  </div>
                );
              }
            })}
            <button className="button" type="button" onClick={handleSave}>Save Task</button>
          </form>
        )}
      </div>
    );
};

export default TaskManager;