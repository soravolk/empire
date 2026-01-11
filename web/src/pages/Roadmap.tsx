import { useState } from "react";
import {
  useFetchRoadmapGoalsQuery,
  useCreateRoadmapGoalMutation,
  useUpdateRoadmapGoalMutation,
  useDeleteRoadmapGoalMutation,
} from "../store/apis/roadmapApi";
import MilestoneView from "../components/MilestoneView";
import GoalView from "../components/GoalView";

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
        <GoalView
          isCreationCard={isCreationCard}
          isCreating={isCreating}
          isEditing={isEditing}
          currentItem={currentItem as Goal}
          newGoal={newGoal}
          editGoal={editGoal}
          onPrevSlide={prevSlide}
          onNextSlide={nextSlide}
          onTitleChange={(value) => setNewGoal({ ...newGoal, title: value })}
          onDateChange={(value) =>
            setNewGoal({ ...newGoal, targetDate: value })
          }
          onCreateSave={handleCreateGoal}
          onCreateCancel={() => {
            setIsCreating(false);
            setNewGoal({ title: "", targetDate: "" });
          }}
          onClickCreate={() => setIsCreating(true)}
          onEditTitle={(value) => setEditGoal({ ...editGoal, title: value })}
          onEditDate={(value) =>
            setEditGoal({ ...editGoal, targetDate: value })
          }
          onEditSave={handleSaveEdit}
          onEditCancel={handleCancelEdit}
          onEdit={handleEditClick}
          onDelete={handleDeleteGoal}
          getProgress={getFakeProgress}
        />

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
