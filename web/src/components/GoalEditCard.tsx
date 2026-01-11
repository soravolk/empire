import React from "react";

interface GoalEditCardProps {
  title: string;
  targetDate: string;
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const GoalEditCard: React.FC<GoalEditCardProps> = ({
  title,
  targetDate,
  onTitleChange,
  onDateChange,
  onSave,
  onCancel,
}) => {
  return (
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
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Target Date
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          onClick={onSave}
          className="flex-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-2 py-1 text-sm bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GoalEditCard;
