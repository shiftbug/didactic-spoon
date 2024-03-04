import React from "react";

function UserInput({ value, onChange, onSubmit }) {
  const handleKeyPress = (event) => {
    // Trigger submit when the user presses Enter
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="user-input">
      <h2>User Input</h2>
      <input
        type="text"
        className="text-input"
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        placeholder="Enter your text here"
      />
      <button className="button" onClick={onSubmit}>
        Submit
      </button>
    </div>
  );
}

export default UserInput;
