import React from "react";

interface Goal {
  goal_id: string;
  title: string;
  targetDate: string;
}

interface GoalCardProps {
  goal: Goal;
  progress: number;
  onEdit: () => void;
  onDelete: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  progress,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className="w-full max-w-md rounded-lg shadow-lg p-6 border border-gray-200 h-64 flex flex-col justify-between"
      style={{ backgroundColor: "rgba(255, 217, 114, 0.7)" }}
    >
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex-1">
          {goal.title}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
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
            onClick={onDelete}
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
          {new Date(goal.targetDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-600">Progress</p>
          <p className="text-lg font-semibold text-blue-600">{progress}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
