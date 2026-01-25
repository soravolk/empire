import { useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { BsArrowRepeat } from "react-icons/bs";
import {
  useCreateMilestoneMutation,
  useDeleteMilestoneMutation,
  useFetchMilestonesQuery,
  useUpdateMilestoneMutation,
} from "../store";
import MilestoneForm from "./MilestoneForm";

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
  // Routine-specific fields
  frequencyCount?: number;
  frequencyPeriod?: "day" | "week" | "month";
  durationAmount?: number;
  durationUnit?: "minutes" | "hours";
  durationPeriod?: "day" | "week" | "month";
  linkedTargetId?: string;
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
    // Routine-specific fields
    frequencyCount: "",
    frequencyPeriod: "week" as "day" | "week" | "month",
    durationAmount: "",
    durationUnit: "minutes" as "minutes" | "hours",
    durationPeriod: "day" as "day" | "week" | "month",
    linkedTargetId: "",
  });
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    null,
  );
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(
    null,
  );
  const [editFormData, setEditFormData] = useState({
    name: "",
    targetDate: "",
    type: "target" as "target" | "routine",
    // Routine-specific fields
    frequencyCount: "",
    frequencyPeriod: "week" as "day" | "week" | "month",
    durationAmount: "",
    durationUnit: "minutes" as "minutes" | "hours",
    durationPeriod: "day" as "day" | "week" | "month",
    linkedTargetId: "",
  });

  // Group milestones by level
  const milestonesByLevel = milestones.reduce(
    (acc, milestone) => {
      const level = milestone.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(milestone);
      return acc;
    },
    {} as Record<number, Milestone[]>,
  );

  // Get max level
  const maxLevel =
    milestones.length > 0 ? Math.max(...milestones.map((m) => m.level)) : 0;

  // Get target milestones for linking
  const targetMilestones = milestones.filter((m) => m.type === "target");

  const handleAddClick = (level: number) => {
    setAddingAtLevel(level);
  };

  const handleCancel = () => {
    setAddingAtLevel(null);
    setFormData({
      name: "",
      targetDate: "",
      type: "target",
      frequencyCount: "",
      frequencyPeriod: "week",
      durationAmount: "",
      durationUnit: "minutes",
      durationPeriod: "day",
      linkedTargetId: "",
    });
  };

  const handleMilestoneClick = (milestoneId: string) => {
    setSelectedMilestoneId(
      selectedMilestoneId === milestoneId ? null : milestoneId,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.targetDate && addingAtLevel !== null) {
      try {
        // Prepare the payload with routine fields if type is "routine"
        const payload: any = {
          goalId,
          name: formData.name,
          targetDate: formData.targetDate,
          level: addingAtLevel,
          type: formData.type,
        };

        // Add routine-specific fields if type is routine
        if (formData.type === "routine") {
          // Add frequency if provided
          if (formData.frequencyCount) {
            payload.frequencyCount = parseInt(formData.frequencyCount, 10);
            payload.frequencyPeriod = formData.frequencyPeriod;
          }

          // Add duration if provided
          if (formData.durationAmount) {
            payload.durationAmount = parseInt(formData.durationAmount, 10);
            payload.durationUnit = formData.durationUnit;
            payload.durationPeriod = formData.durationPeriod;
          }

          // Add linked target if provided
          if (formData.linkedTargetId) {
            payload.linkedTargetId = formData.linkedTargetId;
          }
        }

        await createMilestone(payload).unwrap();

        // Reset form and close
        setFormData({
          name: "",
          targetDate: "",
          type: "target",
          frequencyCount: "",
          frequencyPeriod: "week",
          durationAmount: "",
          durationUnit: "minutes",
          durationPeriod: "day",
          linkedTargetId: "",
        });
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
      frequencyCount: milestone.frequencyCount?.toString() || "",
      frequencyPeriod: milestone.frequencyPeriod || "week",
      durationAmount: milestone.durationAmount?.toString() || "",
      durationUnit: milestone.durationUnit || "minutes",
      durationPeriod: milestone.durationPeriod || "day",
      linkedTargetId: milestone.linkedTargetId || "",
    });
  };

  const handleEditCancel = () => {
    setEditingMilestoneId(null);
    setEditFormData({
      name: "",
      targetDate: "",
      type: "target",
      frequencyCount: "",
      frequencyPeriod: "week",
      durationAmount: "",
      durationUnit: "minutes",
      durationPeriod: "day",
      linkedTargetId: "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      editFormData.name.trim() &&
      editFormData.targetDate &&
      editingMilestoneId
    ) {
      try {
        // Prepare the payload with routine fields if type is "routine"
        const payload: any = {
          goalId,
          milestoneId: editingMilestoneId,
          name: editFormData.name,
          targetDate: editFormData.targetDate,
          type: editFormData.type,
        };

        // Add routine-specific fields if type is routine
        if (editFormData.type === "routine") {
          // Add frequency if provided (or null to clear)
          if (editFormData.frequencyCount) {
            payload.frequencyCount = parseInt(editFormData.frequencyCount, 10);
            payload.frequencyPeriod = editFormData.frequencyPeriod;
          } else {
            payload.frequencyCount = null;
            payload.frequencyPeriod = null;
          }

          // Add duration if provided (or null to clear)
          if (editFormData.durationAmount) {
            payload.durationAmount = parseInt(editFormData.durationAmount, 10);
            payload.durationUnit = editFormData.durationUnit;
            payload.durationPeriod = editFormData.durationPeriod;
          } else {
            payload.durationAmount = null;
            payload.durationUnit = null;
            payload.durationPeriod = null;
          }

          // Always send linkedTargetId (empty string means clear the link)
          payload.linkedTargetId = editFormData.linkedTargetId || null;
        }

        await updateMilestone(payload).unwrap();

        setEditingMilestoneId(null);
        setEditFormData({
          name: "",
          targetDate: "",
          type: "target",
          frequencyCount: "",
          frequencyPeriod: "week",
          durationAmount: "",
          durationUnit: "minutes",
          durationPeriod: "day",
          linkedTargetId: "",
        });
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

          // Sort milestones to group linked pairs together
          // Strategy: Build pairs array where each routine is followed by its target
          const sortedMilestones: Milestone[] = [];
          const processed = new Set<string>();

          // First pass: Add linked pairs (routine + target)
          levelMilestones.forEach((milestone) => {
            if (processed.has(milestone.id)) return;

            if (milestone.type === "routine" && milestone.linkedTargetId) {
              // Find the linked target
              const linkedTarget = levelMilestones.find(
                (m) => m.id === milestone.linkedTargetId,
              );

              if (linkedTarget) {
                // Add routine first, then its target
                sortedMilestones.push(milestone);
                sortedMilestones.push(linkedTarget);
                processed.add(milestone.id);
                processed.add(linkedTarget.id);
              } else {
                // Linked target not found at this level, add routine alone
                sortedMilestones.push(milestone);
                processed.add(milestone.id);
              }
            }
          });

          // Second pass: Add remaining unlinked milestones
          levelMilestones.forEach((milestone) => {
            if (!processed.has(milestone.id)) {
              sortedMilestones.push(milestone);
              processed.add(milestone.id);
            }
          });

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
                        levelMilestones.length / 2,
                      )}
                    />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  {/* Details shown when a milestone at this level is clicked */}
                  {levelMilestones.some(
                    (m) => selectedMilestoneId === m.id,
                  ) && (
                    <div className="text-left mt-2 w-full">
                      {levelMilestones
                        .filter((m) => selectedMilestoneId === m.id)
                        .map((m) => (
                          <div key={m.id}>
                            {editingMilestoneId === m.id ? (
                              <MilestoneForm
                                value={editFormData}
                                onChange={(v) => setEditFormData(v)}
                                onSubmit={handleEditSubmit}
                                onCancel={handleEditCancel}
                                isSubmitting={isUpdating}
                                submitLabel="Save"
                                targetMilestones={targetMilestones}
                              />
                            ) : (
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-base font-semibold text-gray-800 mb-1">
                                    {m.name}
                                  </h3>
                                  <p className="text-xs text-gray-600">
                                    Target:{" "}
                                    {new Date(
                                      m.targetDate,
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
                    <MilestoneForm
                      value={formData}
                      onChange={(v) => setFormData(v)}
                      onSubmit={handleSubmit}
                      onCancel={handleCancel}
                      isSubmitting={isCreating}
                      submitLabel="Add Milestone"
                      targetMilestones={targetMilestones}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4 flex-1 flex-wrap">
                    {/* Render all milestone buttons at this level */}
                    {sortedMilestones.map((milestone, index) => {
                      // Check if this milestone is part of a linked pair
                      const isRoutineWithLink =
                        milestone.type === "routine" &&
                        milestone.linkedTargetId;
                      const linkedTarget = isRoutineWithLink
                        ? sortedMilestones.find(
                            (m) => m.id === milestone.linkedTargetId,
                          )
                        : null;
                      const isLinkedTarget = sortedMilestones.some(
                        (m) =>
                          m.type === "routine" &&
                          m.linkedTargetId === milestone.id,
                      );
                      const linkedRoutine = isLinkedTarget
                        ? sortedMilestones.find(
                            (m) =>
                              m.type === "routine" &&
                              m.linkedTargetId === milestone.id,
                          )
                        : null;

                      // Only render connector after routine milestone (not after target)
                      const shouldShowConnector =
                        isRoutineWithLink && linkedTarget;

                      return (
                        <div
                          key={milestone.id}
                          className={`flex items-center gap-0 ${isRoutineWithLink ? "-mr-4" : ""}`}
                        >
                          <button
                            onMouseEnter={() =>
                              handleMilestoneClick(milestone.id)
                            }
                            onClick={() =>
                              handleMilestoneDoubleClick(milestone)
                            }
                            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedMilestoneId === milestone.id
                                ? "bg-blue-600 border-blue-700"
                                : "bg-blue-500 border-blue-600 hover:bg-blue-600"
                            }`}
                            title="Double-click to view tasks"
                          >
                            {milestone.type === "routine" ? (
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

                          {/* Dashed line connector between routine and linked target */}
                          {shouldShowConnector && (
                            <div className="flex items-center">
                              <svg
                                width="32"
                                height="4"
                                className="text-blue-400"
                              >
                                <line
                                  x1="0"
                                  y1="2"
                                  x2="32"
                                  y2="2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeDasharray="4 4"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}

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
            <div className="flex flex-col w-full border-2 border-blue-400 rounded-lg p-6 bg-white min-h-[200px]">
              <MilestoneForm
                value={formData}
                onChange={(v) => setFormData(v)}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isCreating}
                submitLabel="Add Milestone"
                targetMilestones={targetMilestones}
              />
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
