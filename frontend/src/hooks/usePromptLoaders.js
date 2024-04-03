import { useState } from "react";

const usePromptLoaders = () => {
  const [promptLoaders, setPromptLoaders] = useState([
    {
      id: 0,
      taskId: null,
      taskName: "",
      isActive: true,
      completion: "",
      loaderTier: 1,
      checkedLowers: [],
      userInputChecked: true,
      maxTokens: 0,
    },
  ]);

  const addPromptLoader = () => {
    const newLoader = {
      id: promptLoaders.length,
      taskId: null,
      taskName: "",
      isActive: true,
      completion: "",
      loaderTier: 1,
      checkedLowers: [],
      userInputChecked: true,
      maxTokens: 0,
    };
    setPromptLoaders([...promptLoaders, newLoader]);
  };

  const updatePromptLoader = (updatedLoaders) => {
    setPromptLoaders(updatedLoaders);
  };

  const removePromptLoader = (id) => {
    setPromptLoaders(promptLoaders.filter((loader) => loader.id !== id));
  };

  const handleTaskSelection = (loaderId, taskId, availableTasks) => {
    setPromptLoaders((prevLoaders) =>
      prevLoaders.map((loader) => {
        if (loader.id === loaderId) {
          const selectedTask = availableTasks.find(
            (task) => task.id === taskId
          );
          return {
            ...loader,
            taskId,
            taskName: selectedTask?.task_name || "",
            maxTokens: selectedTask?.max_tokens || 0,
          };
        }
        return loader;
      })
    );
  };

  const handleTierChange = (loaderId, tier, availableTasks) => {
    setPromptLoaders((prevLoaders) =>
      prevLoaders.map((loader) => {
        if (loader.id === loaderId) {
          const lowerTiers = prevLoaders.filter(
            (otherLoader) =>
              otherLoader.loaderTier < tier &&
              otherLoader.taskId &&
              otherLoader.isActive
          );
          const checkedLowers = lowerTiers.map((lower) => ({
            id: lower.id,
            taskId: lower.taskId,
            taskName: lower.taskName,
          }));
          return { ...loader, loaderTier: tier, checkedLowers };
        }
        return loader;
      })
    );
  };

  return [
    promptLoaders,
    addPromptLoader,
    updatePromptLoader,
    removePromptLoader,
    handleTaskSelection,
    handleTierChange,
  ];
};

export default usePromptLoaders;
