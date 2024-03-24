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
      <h2>Add Your Input Below</h2>
      <textarea
        className="text-input"
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        placeholder="Enter your text here"
        rows={4} // Adjust the number of rows as needed for a bigger vertical window
      />
      <button className="button" onClick={onSubmit}>
        Submit
      </button>
    </div>
  );
}

export default UserInput;
