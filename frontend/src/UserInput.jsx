// UserInput.jsx
import React from "react";
import PropTypes from "prop-types";
import styles from "./UserInput.module.css";

function UserInput({ text, onTextChange, onSubmit }) {
  return (
    <div className={styles.userInput}>
      <h2>User Input</h2>
      <textarea value={text} onChange={(e) => onTextChange(e.target.value)} />
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
}

UserInput.propTypes = {
  text: PropTypes.string.isRequired,
  onTextChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default UserInput;
