import React, { useState } from "react";
import { MdClose, MdDelete, MdEdit, MdCheck } from "react-icons/md";
import {
  useCreateTaskInMilestoneMutation,
  useGetTasksByMilestoneQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "../store";

interface Task {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  timeSpent: number; // in minutes or hours
}

interface TaskViewProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string;
  milestoneName: string;
}

const TaskView: React.FC<TaskViewProps> = ({
  isOpen,
  onClose,
  milestoneId,
  milestoneName,
}) => {
  const {
    data: tasksData,
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useGetTasksByMilestoneQuery(milestoneId);

  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    dueDate: "",
  });

  const [sliderValues, setSliderValues] = useState<{ [key: string]: number }>(
    {}
  );

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState({
    name: "",
    description: "",
  });

  const [createTask, { isLoading: isCreatingTask }] =
    useCreateTaskInMilestoneMutation();

  const [updateTask] = useUpdateTaskMutation();

  const [deleteTask] = useDeleteTaskMutation();

  // Convert API data to local format
  const tasks: Task[] =
    tasksData?.map((task) => ({
      id: task.task_id,
      name: task.name,
      description: task.description || "",
      dueDate: task.due_date || "",
      timeSpent: task.time_spent,
    })) || [];

  const handleCreateTask = async () => {
    if (newTask.name.trim() && newTask.dueDate) {
      try {
        await createTask({
          milestone_id: milestoneId,
          name: newTask.name,
          description: newTask.description,
          due_date: newTask.dueDate,
        }).unwrap();

        setNewTask({ name: "", description: "", dueDate: "" });
        setIsCreating(false);
      } catch (error) {
        console.error("Failed to create task:", error);
        alert("Failed to create task. Please try again.");
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId).unwrap();
      } catch (error) {
        console.error("Failed to delete task:", error);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  const handleTimeSpentChange = async (
    taskId: string,
    additionalTime: number
  ) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        await updateTask({
          task_id: taskId,
          time_spent: task.timeSpent + additionalTime,
        }).unwrap();
      }
    } catch (error) {
      console.error("Failed to update time spent:", error);
      alert("Failed to update time. Please try again.");
    }
  };

  const handleSliderChange = (taskId: string, value: number) => {
    setSliderValues({ ...sliderValues, [taskId]: value });
  };

  const handleSliderRelease = (taskId: string) => {
    // Just update the slider value, don't auto-add time
    // User needs to click confirm button
  };

  const handleConfirmTime = (taskId: string) => {
    const value = sliderValues[taskId] || 0;
    if (value > 0) {
      handleTimeSpentChange(taskId, value);
      setSliderValues({ ...sliderValues, [taskId]: 0 });
    }
  };

  const handleCancelTime = (taskId: string) => {
    setSliderValues({ ...sliderValues, [taskId]: 0 });
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTask({
      name: task.name,
      description: task.description,
    });
  };

  const handleSaveEdit = async (taskId: string) => {
    try {
      await updateTask({
        task_id: taskId,
        name: editedTask.name,
        description: editedTask.description,
      }).unwrap();
      setEditingTaskId(null);
      setEditedTask({ name: "", description: "" });
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditedTask({ name: "", description: "" });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white bg-opacity-25 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {milestoneName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <MdClose className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Task List */}
            <div className="space-y-3 max-w-2xl mx-auto">
              {isLoadingTasks && (
                <div className="text-center py-12 text-gray-500">
                  Loading tasks...
                </div>
              )}

              {!isLoadingTasks && tasks.length === 0 && !isCreating && (
                <div className="text-center py-12 text-gray-500">
                  No tasks yet. Click "Add New Task" to create one.
                </div>
              )}

              {!isLoadingTasks &&
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-3xl bg-white bg-opacity-60 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="px-6 py-3 rounded-full border border-gray-400 bg-gradient-to-r from-white/10 to-gray-100/90 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        {editingTaskId === task.id ? (
                          <input
                            type="text"
                            value={editedTask.name}
                            onChange={(e) =>
                              setEditedTask({
                                ...editedTask,
                                name: e.target.value,
                              })
                            }
                            className="flex-1 px-2 py-1 text-lg font-semibold bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
                          />
                        ) : (
                          <h4 className="text-lg font-semibold text-gray-800">
                            {task.name}
                          </h4>
                        )}
                        <div className="text-sm text-gray-600 ml-4">
                          Total: {task.timeSpent} min
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {editingTaskId === task.id ? (
                            <textarea
                              value={editedTask.description}
                              onChange={(e) =>
                                setEditedTask({
                                  ...editedTask,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
                              rows={3}
                              placeholder="Enter task description"
                            />
                          ) : (
                            task.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {task.description}
                              </p>
                            )
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          {editingTaskId === task.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(task.id)}
                                className="p-2 rounded-md hover:bg-green-50 text-green-600 transition-colors"
                                aria-label="Save changes"
                              >
                                <MdCheck className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                                aria-label="Cancel edit"
                              >
                                <MdClose className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-2 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                              aria-label="Edit task"
                            >
                              <MdEdit className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                            aria-label="Delete task"
                          >
                            <MdDelete className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex-1 flex items-center gap-3 mr-4">
                          <label className="text-xs text-gray-500 whitespace-nowrap">
                            Add time:
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="120"
                            step="5"
                            value={sliderValues[task.id] || 0}
                            onChange={(e) =>
                              handleSliderChange(
                                task.id,
                                parseInt(e.target.value)
                              )
                            }
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <span className="text-xs text-gray-600 font-medium min-w-[3rem] text-right">
                            +{sliderValues[task.id] || 0} min
                          </span>
                        </div>

                        {sliderValues[task.id] > 0 ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConfirmTime(task.id)}
                              className="p-2 rounded-full bg-gray-400 hover:bg-gray-500 text-white transition-colors"
                              aria-label="Confirm time"
                            >
                              <MdCheck className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleCancelTime(task.id)}
                              className="p-2 rounded-full border bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 transition-colors"
                              aria-label="Cancel"
                            >
                              <MdClose className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            className={`px-3 py-1 text-sm rounded-full border bg-gray-100 hover:bg-blue-100 text-gray-800 border-gray-300`}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Create Task Form */}
            {isCreating && (
              <div className="mt-4 max-w-2xl mx-auto border border-gray-200 rounded-3xl bg-white bg-opacity-60 hover:shadow-md transition-shadow overflow-hidden">
                <div className="px-6 py-3 rounded-full border border-gray-400 bg-gradient-to-r from-white/10 to-gray-100/90 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-gray-800">
                    New Task
                  </h3>
                </div>

                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Task Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter task name"
                      value={newTask.name}
                      onChange={(e) =>
                        setNewTask({ ...newTask, name: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter task description"
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) =>
                        setNewTask({ ...newTask, dueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCreateTask}
                      disabled={isCreatingTask}
                      className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingTask ? "Creating..." : "Create"}
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setNewTask({ name: "", description: "", dueDate: "" });
                      }}
                      className="flex-1 px-4 py-2 text-sm bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Add Task Button */}
            {!isCreating && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-14 h-14 rounded-full bg-white bg-opacity-30 hover:bg-gray-300 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                  aria-label="Add new task"
                  title="Add new task"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskView;
