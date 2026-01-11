import React from "react";
import GoalCard from "./GoalCard";
import GoalEditCard from "./GoalEditCard";
import GoalCreationCard from "./GoalCreationCard";

interface Goal {
  goal_id: string;
  title: string;
  targetDate: string;
}

interface GoalViewProps {
  isCreationCard: boolean;
  isCreating: boolean;
  isEditing: boolean;
  currentItem: Goal;
  newGoal: { title: string; targetDate: string };
  editGoal: { title: string; targetDate: string };
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onCreateSave: () => void;
  onCreateCancel: () => void;
  onClickCreate: () => void;
  onEditTitle: (value: string) => void;
  onEditDate: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getProgress: (goalId: string) => number;
}

const GoalView: React.FC<GoalViewProps> = ({
  isCreationCard,
  isCreating,
  isEditing,
  currentItem,
  newGoal,
  editGoal,
  onPrevSlide,
  onNextSlide,
  onTitleChange,
  onDateChange,
  onCreateSave,
  onCreateCancel,
  onClickCreate,
  onEditTitle,
  onEditDate,
  onEditSave,
  onEditCancel,
  onEdit,
  onDelete,
  getProgress,
}) => {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Previous Button */}
      <button
        onClick={onPrevSlide}
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
        <GoalCreationCard
          isCreating={isCreating}
          title={newGoal.title}
          targetDate={newGoal.targetDate}
          onTitleChange={onTitleChange}
          onDateChange={onDateChange}
          onSave={onCreateSave}
          onCancel={onCreateCancel}
          onClickCreate={onClickCreate}
        />
      ) : !isEditing ? (
        <GoalCard
          goal={currentItem}
          progress={getProgress(currentItem.goal_id)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <GoalEditCard
          title={editGoal.title}
          targetDate={editGoal.targetDate}
          onTitleChange={onEditTitle}
          onDateChange={onEditDate}
          onSave={onEditSave}
          onCancel={onEditCancel}
        />
      )}

      {/* Next Button */}
      <button
        onClick={onNextSlide}
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
  );
};

export default GoalView;
