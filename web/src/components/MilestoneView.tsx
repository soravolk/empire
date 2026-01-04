import { useState } from "react";
import { useCreateMilestoneMutation } from "../store";

interface MilestoneViewProps {
  goalId: string;
}

interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  level: number;
}

export default function MilestoneView({ goalId }: MilestoneViewProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [createMilestone, { isLoading: isCreating }] =
    useCreateMilestoneMutation();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", targetDate: "" });
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    null
  );

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setFormData({ name: "", targetDate: "" });
  };

  const handleMilestoneClick = (milestoneId: string) => {
    setSelectedMilestoneId(
      selectedMilestoneId === milestoneId ? null : milestoneId
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.targetDate) {
      try {
        const newMilestone = await createMilestone({
          goalId,
          name: formData.name,
          targetDate: formData.targetDate,
          level: milestones.length + 1,
        }).unwrap();

        // Add to local state
        setMilestones([
          ...milestones,
          {
            id: newMilestone.id,
            name: newMilestone.name,
            targetDate: newMilestone.targetDate,
            level: newMilestone.level,
          },
        ]);
        setFormData({ name: "", targetDate: "" });
        setIsAdding(false);
      } catch (error) {
        console.error("Failed to create milestone:", error);
      }
    }
  };

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

        {/* Existing Milestones */}
        {milestones.map((milestone, index) => (
          <div className="w-full" key={milestone.id}>
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
            <div className="flex flex-col w-full border-2  border-gray-300 bg-gray-50 rounded-lg p-6 h-[200px]">
              <div className="flex flex-col justify-between items-start mb-4">
                <div className="text-sm text-gray-600 font-medium">
                  Level {milestone.level}
                </div>
                {/* Details shown when clicked */}
                {selectedMilestoneId === milestone.id && (
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-semibold text-gray-800 mb-1">
                      {milestone.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      Target:{" "}
                      {new Date(milestone.targetDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-4 flex-1">
                {/* Round Milestone Button */}
                <button
                  onClick={() => handleMilestoneClick(milestone.id)}
                  className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedMilestoneId === milestone.id
                      ? "bg-blue-600 border-blue-700"
                      : "bg-blue-500 border-blue-600 hover:bg-blue-600"
                  }`}
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    stroke="none"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>

                {/* Add Button (without text) */}
                <button
                  onClick={handleAddClick}
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
            </div>
          </div>
        ))}

        {/* Empty Next Level Card - always show when there are milestones */}
        {milestones.length > 0 && (
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

            {/* Next Level Card with Add Button */}
            {isAdding ? (
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
              <div className="flex flex-col w-full border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all h-[200px]">
                <div className="text-sm text-gray-600 font-medium mb-4">
                  Level {milestones.length + 1}
                </div>
                <div className="flex flex-col items-center justify-center flex-1">
                  {/* Add Milestone Button with text */}
                  <button
                    onClick={handleAddClick}
                    className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 bg-white hover:bg-gray-50 hover:border-gray-500 flex items-center justify-center transition-all mb-3"
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
                  <p className="text-sm text-gray-600 font-medium">
                    Add Milestone
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Arrow before Add Milestone - only show if no milestones */}
        {milestones.length === 0 && (
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
        )}

        {/* Add Milestone Card - only show if no milestones or when adding */}
        {(milestones.length === 0 || isAdding) && (
          <>
            {isAdding ? (
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
              milestones.length === 0 && (
                <div
                  onClick={handleAddClick}
                  className="flex flex-col w-full border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer h-[200px]"
                >
                  <div className="text-sm text-gray-600 font-medium mb-4">
                    Level {milestones.length + 1}
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
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
