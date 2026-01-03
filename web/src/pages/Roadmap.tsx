import { useState } from "react";
import {
  useFetchRoadmapGoalsQuery,
  useCreateRoadmapGoalMutation,
  useUpdateRoadmapGoalMutation,
  useDeleteRoadmapGoalMutation,
} from "../store/apis/roadmapApi";
import MilestoneView from "../components/MilestoneView";

interface Goal {
  goal_id: string;
  title: string;
  targetDate: string;
}

// Generate fake progress based on goal_id (deterministic)
const getFakeProgress = (goalId: string): number => {
  const hash = goalId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 80) + 10; // Between 10-90%
};

export default function Roadmap() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", targetDate: "" });
  const [editGoal, setEditGoal] = useState({ title: "", targetDate: "" });

  const { data: goals = [], isLoading, error } = useFetchRoadmapGoalsQuery();
  const [createGoal] = useCreateRoadmapGoalMutation();
  const [updateGoal] = useUpdateRoadmapGoalMutation();
  const [deleteGoal] = useDeleteRoadmapGoalMutation();

  const allItems: any[] = [
    ...goals,
    { goal_id: "create", isCreationCard: true },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % allItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
  };

  const currentItem = allItems[currentIndex];
  const isCreationCard = currentItem?.isCreationCard === true;

  const handleCreateGoal = () => {
    if (newGoal.title && newGoal.targetDate) {
      createGoal({
        title: newGoal.title,
        targetDate: newGoal.targetDate,
      });
      setNewGoal({ title: "", targetDate: "" });
      setIsCreating(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditGoal({
      title: (currentItem as Goal).title,
      targetDate: (currentItem as Goal).targetDate,
    });
  };

  const handleSaveEdit = async () => {
    if (!editGoal.title || !editGoal.targetDate) return;

    try {
      await updateGoal({
        goal_id: (currentItem as Goal).goal_id,
        title: editGoal.title,
        targetDate: editGoal.targetDate,
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditGoal({ title: "", targetDate: "" });
  };

  const handleDeleteGoal = async () => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      await deleteGoal((currentItem as Goal).goal_id).unwrap();
      // Move to previous item or reset to first item after deletion
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else {
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Goals</h1>

      <div className="relative">
        {/* Carousel Container */}
        <div className="flex items-center justify-center gap-4">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label="Previous goal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Goal Card or Creation Card */}
          {isCreationCard ? (
            !isCreating ? (
              <div
                onClick={() => setIsCreating(true)}
                className="w-full max-w-md rounded-lg shadow-lg p-6 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-gray-200 hover:border-gray-500 transition-all"
                style={{ backgroundColor: "rgba(200, 200, 200, 0.2)" }}
              >
                <svg
                  className="w-16 h-16 text-gray-600 mb-4"
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
                <h2 className="text-2xl font-semibold text-gray-700 mb-2 text-center">
                  Create New Goal
                </h2>
                <p className="text-sm text-gray-600 text-center">
                  Click to add a new goal to your roadmap
                </p>
              </div>
            ) : (
              <div
                className="w-full max-w-md rounded-lg shadow-lg p-6 border border-gray-200 h-64 flex flex-col justify-between overflow-hidden"
                style={{ backgroundColor: "rgba(255, 217, 114, 0.7)" }}
              >
                <h2 className="text-2xl font-semibold mb-3 text-gray-800">
                  New Goal
                </h2>

                <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Goal Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter goal title"
                      value={newGoal.title}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, title: e.target.value })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, targetDate: e.target.value })
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleCreateGoal}
                    className="flex-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewGoal({ title: "", targetDate: "" });
                    }}
                    className="flex-1 px-2 py-1 text-sm bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          ) : !isEditing ? (
            <div
              className="w-full max-w-md rounded-lg shadow-lg p-6 border border-gray-200 h-64 flex flex-col justify-between"
              style={{ backgroundColor: "rgba(255, 217, 114, 0.7)" }}
            >
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex-1">
                  {(currentItem as Goal).title}
                </h2>
                <div className="flex gap-1">
                  <button
                    onClick={handleEditClick}
                    className="p-1.5 rounded-md hover:bg-gray-200/30 transition-colors"
                    aria-label="Edit goal"
                    title="Edit goal"
                  >
                    <svg
                      className="w-4 h-4 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleDeleteGoal}
                    className="p-1.5 rounded-md hover:bg-red-100/50 transition-colors"
                    aria-label="Delete goal"
                    title="Delete goal"
                  >
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Target Date</p>
                <p className="text-lg font-medium text-gray-800">
                  {new Date(
                    (currentItem as Goal).targetDate
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {getFakeProgress((currentItem as Goal).goal_id)}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${getFakeProgress(
                        (currentItem as Goal).goal_id
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              className="w-full max-w-md rounded-lg shadow-lg p-6 border border-gray-200 h-64 flex flex-col justify-between overflow-hidden"
              style={{ backgroundColor: "rgba(255, 217, 114, 0.7)" }}
            >
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">
                Edit Goal
              </h2>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter goal title"
                    value={editGoal.title}
                    onChange={(e) =>
                      setEditGoal({ ...editGoal, title: e.target.value })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={editGoal.targetDate}
                    onChange={(e) =>
                      setEditGoal({ ...editGoal, targetDate: e.target.value })
                    }
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-2 py-1 text-sm bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label="Next goal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Indicators */}
        {/* <div className="flex justify-center gap-2 mt-6">
          {allItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? "bg-blue-600" : "bg-gray-300"
              }`}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div> */}
      </div>

      {/* Milestone View - only show when not on creation card */}
      {!isCreationCard && (
        <MilestoneView goalId={(currentItem as Goal).goal_id} />
      )}
    </div>
  );
}
