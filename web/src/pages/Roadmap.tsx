import { useState } from "react";

interface Goal {
  id: string;
  title: string;
  targetDate: string;
  progress: number;
}

// Mock data for now
const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Learn TypeScript",
    targetDate: "2026-03-01",
    progress: 65,
  },
  {
    id: "2",
    title: "Build Full-Stack App",
    targetDate: "2026-06-15",
    progress: 40,
  },
  {
    id: "3",
    title: "Master AWS",
    targetDate: "2026-12-31",
    progress: 25,
  },
  {
    id: "4",
    title: "Complete Side Project",
    targetDate: "2026-04-20",
    progress: 80,
  },
];

export default function Roadmap() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mockGoals.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + mockGoals.length) % mockGoals.length);
  };

  const currentGoal = mockGoals[currentIndex];

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

          {/* Goal Card */}
          <div
            className="w-full max-w-md rounded-lg shadow-lg p-6 border border-gray-200"
            style={{ backgroundColor: "rgba(255, 217, 114, 0.7)" }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {currentGoal.title}
            </h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Target Date</p>
              <p className="text-lg font-medium text-gray-800">
                {new Date(currentGoal.targetDate).toLocaleDateString("en-US", {
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
                  {currentGoal.progress}%
                </p>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${currentGoal.progress}%` }}
                />
              </div>
            </div>
          </div>

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
        <div className="flex justify-center gap-2 mt-6">
          {mockGoals.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? "bg-blue-600" : "bg-gray-300"
              }`}
              aria-label={`Go to goal ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
