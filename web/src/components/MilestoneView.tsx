import { useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { BsArrowRepeat } from "react-icons/bs";
import {
  useCreateMilestoneMutation,
  useDeleteMilestoneMutation,
  useFetchMilestonesQuery,
  useUpdateMilestoneMutation,
} from "../store";

interface MilestoneViewProps {
  goalId: string;
  onMilestoneDoubleClick?: (milestone: { id: string; name: string }) => void;
}

interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  level: number;
  type?: "target" | "routine";
}

// Progress Bar Component for Milestone Level
function MilestoneProgressBar({
  totalMilestones,
  completedMilestones,
}: {
  totalMilestones: number;
  completedMilestones: number;
}) {
  const progress =
    totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 font-medium min-w-[3rem]">
        {completedMilestones}/{totalMilestones}
      </span>
    </div>
  );
}

export default function MilestoneView({
  goalId,
  onMilestoneDoubleClick,
}: MilestoneViewProps) {
  const {
    data: milestones = [],
    isLoading,
    error,
  } = useFetchMilestonesQuery(goalId);
  const [createMilestone, { isLoading: isCreating }] =
    useCreateMilestoneMutation();
  const [deleteMilestone, { isLoading: isDeleting }] =
    useDeleteMilestoneMutation();
  const [updateMilestone, { isLoading: isUpdating }] =
    useUpdateMilestoneMutation();
  const [addingAtLevel, setAddingAtLevel] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    targetDate: "",
    type: "target" as "target" | "routine",
  });
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    null
  );
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(
    null
  );
  const [editFormData, setEditFormData] = useState({
    name: "",
    targetDate: "",
    type: "target" as "target" | "routine",
  });

  // Group milestones by level
  const milestonesByLevel = milestones.reduce((acc, milestone) => {
    const level = milestone.level;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(milestone);
    return acc;
  }, {} as Record<number, Milestone[]>);

  // Get max level
  const maxLevel =
    milestones.length > 0 ? Math.max(...milestones.map((m) => m.level)) : 0;

  const handleAddClick = (level: number) => {
    setAddingAtLevel(level);
  };

  const handleCancel = () => {
    setAddingAtLevel(null);
    setFormData({ name: "", targetDate: "", type: "target" });
  };

  const handleMilestoneClick = (milestoneId: string) => {
    setSelectedMilestoneId(
      selectedMilestoneId === milestoneId ? null : milestoneId
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.targetDate && addingAtLevel !== null) {
      try {
        await createMilestone({
          goalId,
          name: formData.name,
          targetDate: formData.targetDate,
          level: addingAtLevel,
          type: formData.type,
        }).unwrap();

        // Reset form and close
        setFormData({ name: "", targetDate: "", type: "target" });
        setAddingAtLevel(null);
      } catch (error) {
        console.error("Failed to create milestone:", error);
      }
    }
  };

  const handleDelete = async (milestoneId: string) => {
    if (window.confirm("Are you sure you want to delete this milestone?")) {
      try {
        await deleteMilestone({ goalId, milestoneId }).unwrap();
        setSelectedMilestoneId(null);
      } catch (error) {
        console.error("Failed to delete milestone:", error);
      }
    }
  };

  const handleEditClick = (milestone: Milestone) => {
    setEditingMilestoneId(milestone.id);
    setEditFormData({
      name: milestone.name,
      targetDate: milestone.targetDate,
      type: milestone.type || "target",
    });
  };

  const handleEditCancel = () => {
    setEditingMilestoneId(null);
    setEditFormData({ name: "", targetDate: "", type: "target" });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      editFormData.name.trim() &&
      editFormData.targetDate &&
      editingMilestoneId
    ) {
      try {
        await updateMilestone({
          goalId,
          milestoneId: editingMilestoneId,
          name: editFormData.name,
          targetDate: editFormData.targetDate,
          type: editFormData.type,
        }).unwrap();

        setEditingMilestoneId(null);
        setEditFormData({ name: "", targetDate: "", type: "target" });
      } catch (error) {
        console.error("Failed to update milestone:", error);
      }
    }
  };

  const handleMilestoneDoubleClick = (milestone: Milestone) => {
    if (onMilestoneDoubleClick) {
      onMilestoneDoubleClick({ id: milestone.id, name: milestone.name });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-600">Loading milestones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center h-40">
          <p className="text-red-600">Failed to load milestones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      {/* Milestone Cards Container */}
      <div className="flex flex-col items-center gap-0">
        {/* Start Box */}
        <div className="flex flex-col items-center">
          <div className="border-2 border-gray-300 bg-gray-50 rounded p-2 flex items-center justify-center">
            <span className="text-xs text-gray-600 font-medium">Start</span>
          </div>
        </div>

        {/* Render milestone cards by level */}
        {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => {
          const levelMilestones = milestonesByLevel[level] || [];
          const isAddingAtThisLevel = addingAtLevel === level;

          return (
            <div className="w-full" key={level}>
              {/* Arrow */}
              <div className="flex items-center justify-center">
                <svg
                  className="w-6 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>

              {/* Milestone Card */}
              <div className="flex flex-col w-full border-2 border-gray-300 bg-gray-50 rounded-lg p-6 min-h-[200px]">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm text-gray-600 font-medium">
                    Level {level}
                  </div>
                  {/* Progress Bar - show if there are milestones at this level */}
                  {levelMilestones.length > 0 && (
                    <MilestoneProgressBar
                      totalMilestones={levelMilestones.length}
                      completedMilestones={Math.floor(
                        levelMilestones.length / 2
                      )}
                    />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  {/* Details shown when a milestone at this level is clicked */}
                  {levelMilestones.some(
                    (m) => selectedMilestoneId === m.id
                  ) && (
                    <div className="text-left mt-2 w-full">
                      {levelMilestones
                        .filter((m) => selectedMilestoneId === m.id)
                        .map((m) => (
                          <div key={m.id}>
                            {editingMilestoneId === m.id ? (
                              <form
                                onSubmit={handleEditSubmit}
                                className="flex flex-col gap-2"
                              >
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Milestone Name
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        name: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter milestone name"
                                    autoFocus
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Milestone Type
                                  </label>
                                  <select
                                    value={editFormData.type}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        type: e.target.value as
                                          | "target"
                                          | "routine",
                                      })
                                    }
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="target">Target</option>
                                    <option value="routine">Routine</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Target Date
                                  </label>
                                  <input
                                    type="date"
                                    value={editFormData.targetDate}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        targetDate: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={handleEditCancel}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-md transition-colors"
                                  >
                                    {isUpdating ? "Saving..." : "Save"}
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-base font-semibold text-gray-800 mb-1">
                                    {m.name}
                                  </h3>
                                  <p className="text-xs text-gray-600">
                                    Target:{" "}
                                    {new Date(
                                      m.targetDate
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditClick(m)}
                                    className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit milestone"
                                  >
                                    <MdEdit className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(m.id)}
                                    disabled={isDeleting}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete milestone"
                                  >
                                    <MdDelete className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Show form if adding at this level */}
                {isAddingAtThisLevel ? (
                  <div className="flex-1">
                    <form
                      onSubmit={handleSubmit}
                      className="h-full flex flex-col gap-2"
                    >
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Milestone Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter milestone name"
                          autoFocus
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Milestone Type
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              type: e.target.value as "target" | "routine",
                            })
                          }
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="target">Target</option>
                          <option value="routine">Routine</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Target Date
                        </label>
                        <input
                          type="date"
                          value={formData.targetDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              targetDate: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex gap-2 justify-end mt-auto">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreating}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-md transition-colors"
                        >
                          {isCreating ? "Adding..." : "Add Milestone"}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4 flex-1 flex-wrap">
                    {/* Render all milestone buttons at this level */}
                    {levelMilestones.map((milestone) => (
                      <button
                        key={milestone.id}
                        onMouseEnter={() => handleMilestoneClick(milestone.id)}
                        onClick={() => handleMilestoneDoubleClick(milestone)}
                        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedMilestoneId === milestone.id
                            ? "bg-blue-600 border-blue-700"
                            : "bg-blue-500 border-blue-600 hover:bg-blue-600"
                        }`}
                        title="Double-click to view tasks"
                      >
                        {milestone.type !== "routine" ? (
                          <BsArrowRepeat className="w-8 h-8 text-white" />
                        ) : (
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            stroke="none"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        )}
                      </button>
                    ))}

                    {/* Add Button */}
                    <button
                      onClick={() => handleAddClick(level)}
                      className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 bg-white hover:bg-gray-50 hover:border-gray-500 flex items-center justify-center transition-all"
                    >
                      <svg
                        className="w-8 h-8 text-gray-600"
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
          );
        })}

        {/* Next Level Card - for adding a new level */}
        <>
          {/* Arrow */}
          <div className="flex items-center justify-center">
            <svg
              className="w-6 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>

          {/* Show form if adding at the next level, otherwise show add button card */}
          {addingAtLevel === maxLevel + 1 ? (
            <div className="flex flex-col w-full border-2 border-blue-400 rounded-lg p-6 bg-white h-[200px]">
              <form
                onSubmit={handleSubmit}
                className="h-full flex flex-col gap-2"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Milestone Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter milestone name"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end mt-auto">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    {isCreating ? "Adding..." : "Add Milestone"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div
              onClick={() => handleAddClick(maxLevel + 1)}
              className="flex flex-col w-full border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer h-[200px]"
            >
              <div className="text-sm text-gray-600 font-medium mb-4">
                Level {maxLevel + 1}
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="w-12 h-12 rounded-full border-2 border-gray-400 flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-gray-600"
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
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Add Milestone
                </p>
              </div>
            </div>
          )}
        </>
      </div>
    </div>
  );
}
