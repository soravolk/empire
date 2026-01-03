interface MilestoneViewProps {
  goalId: string;
}

export default function MilestoneView({ goalId }: MilestoneViewProps) {
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

        {/* Add Milestone Card */}
        <div className="flex flex-col w-full border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer min-h-[150px]">
          <div className="text-sm text-gray-600 font-medium mb-4">Level 1</div>
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
            <p className="text-sm text-gray-600 font-medium">Add Milestone</p>
          </div>
        </div>
      </div>
    </div>
  );
}
