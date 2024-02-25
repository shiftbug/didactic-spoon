import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Sidebar from './Sidebar'
import Module from './Module'

const Thing = ({ name }) => {
  return (
    <div>Hi, I'm {name}</div>
  )
}

function App() {
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [completionText, setCompletionText] = useState('');
  const [recentFiles, setRecentFiles] = useState([]);
  const [modelParameters, setModelParameters] = useState({
    temperature: 0.7,
    maxTokens: 200,
  });
  // State variable to store the list of modules

  useEffect(() => {
    // Fetch recent files on component mount
    fetch('http://localhost:5000/list_recent_files')
      .then(response => response.json())
      .then(data => {
        setRecentFiles(data.files);
      })
      .catch(error => console.error('Error fetching recent files:', error));
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const saveFile = () => {
    // Implement file saving logic here
    console.log('Saving file', file);
  };

  const sendCompletion = () => {
    // Implement sending completion text logic here
    console.log('Sending completion:', completionText);
  };

  const handleModelParameterChange = (event) => {
    const { name, value } = event.target;
    setModelParameters(prevParams => ({
      ...prevParams,
      [name]: value,
    }));
  };

  return (
    <div className="app">
      <Sidebar recentFiles={recentFiles} />
      <button onClick={newSend}>New Send</button>
      <div className="file-controls">
        <input type="file" id="file-input" accept=".txt" onChange={handleFileChange} />
        <button onClick={saveFile}>Save</button>
      </div>
      <textarea
        id="text-content"
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        rows="20"
        cols="50"
      />
      <div className="text-entry">
        <textarea
          id="completion-text"
          value={completionText}
          onChange={(e) => setCompletionText(e.target.value)}
          rows="4"
          cols="50"
        />
        <button type="button" onClick={sendCompletion}>Send</button>
      </div>
      <div className="control-panel">
        <h3>Model Parameters</h3>
        <div className="slider-container">
          <label htmlFor="temperature">Temperature:</label>
          <input
            type="range"
            id="temperature-slider"
            name="temperature"
            min="0"
            max="1"
            step="0.01"
            value={modelParameters.temperature}
            onChange={handleModelParameterChange}
          />
          <input
            type="number"
            id="temperature"
            name="temperature"
            min="0"
            max="1"
            step="0.01"
            value={modelParameters.temperature}
            className="slider-value"
            onChange={handleModelParameterChange}
          />
        </div>
        <div className="slider-container">
          <label htmlFor="maxTokens">Max Tokens:</label>
          <input
            type="range"
            id="max_tokens-slider"
            name="maxTokens"
            min="1"
            max="512"
            step="1"
            value={modelParameters.maxTokens}
            onChange={handleModelParameterChange}
          />
          <input
            type="number"
            id="maxTokens"
            name="maxTokens"
            min="1"
            max="512"
            step="1"
            value={modelParameters.maxTokens}
            className="slider-value"
            onChange={handleModelParameterChange}
          />
        </div>
      </div>
      <Module />
    </div>
  );

}

export default App
