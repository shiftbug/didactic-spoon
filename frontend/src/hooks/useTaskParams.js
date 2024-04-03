// useTaskParams.js
import { useState, useEffect } from "react";
import axios from "axios";

const useTaskParams = () => {
  const [taskParams, setTaskParams] = useState({});

  useEffect(() => {
    const fetchTaskParams = async () => {
      try {
        const response = await axios.get("/tasks");
        setTaskParams(response.data);
      } catch (error) {
        console.error("Error fetching task parameters:", error);
      }
    };

    fetchTaskParams();
  }, []);

  return [taskParams, setTaskParams];
};

export default useTaskParams;
