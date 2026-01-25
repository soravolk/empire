import React from "react";

type FrequencyPeriod = "day" | "week" | "month";
type DurationUnit = "minutes" | "hours";

export interface MilestoneFormState {
  name: string;
  targetDate: string;
  type: "target" | "routine";
  frequencyCount: string;
  frequencyPeriod: FrequencyPeriod;
  durationAmount: string;
  durationUnit: DurationUnit;
  durationPeriod: FrequencyPeriod;
  linkedTargetId: string;
}

interface TargetMilestone {
  id: string;
  name: string;
  level: number;
}

interface Props {
  value: MilestoneFormState;
  onChange: (value: MilestoneFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  targetMilestones?: TargetMilestone[];
}

export default function MilestoneForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Save",
  targetMilestones = [],
}: Props) {
  return (
    <form onSubmit={onSubmit} className="h-full flex flex-col gap-2">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Milestone Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="milestone-type"
              value="target"
              checked={value.type === "target"}
              onChange={() => onChange({ ...value, type: "target" })}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Target</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="milestone-type"
              value="routine"
              checked={value.type === "routine"}
              onChange={() => onChange({ ...value, type: "routine" })}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Routine</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Milestone Name
        </label>
        <input
          type="text"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter milestone name"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Target Date
        </label>
        <input
          type="date"
          value={value.targetDate}
          onChange={(e) => onChange({ ...value, targetDate: e.target.value })}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {value.type === "routine" && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Frequency (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={value.frequencyCount}
                onChange={(e) =>
                  onChange({ ...value, frequencyCount: e.target.value })
                }
                className="w-20 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3"
              />
              <span className="flex items-center text-sm text-gray-600">
                times per
              </span>
              <select
                value={value.frequencyPeriod}
                onChange={(e) =>
                  onChange({
                    ...value,
                    frequencyPeriod: e.target.value as FrequencyPeriod,
                  })
                }
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Duration (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={value.durationAmount}
                onChange={(e) =>
                  onChange({ ...value, durationAmount: e.target.value })
                }
                className="w-20 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="30"
              />
              <select
                value={value.durationUnit}
                onChange={(e) =>
                  onChange({
                    ...value,
                    durationUnit: e.target.value as DurationUnit,
                  })
                }
                className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
              <span className="flex items-center text-sm text-gray-600">
                per
              </span>
              <select
                value={value.durationPeriod}
                onChange={(e) =>
                  onChange({
                    ...value,
                    durationPeriod: e.target.value as FrequencyPeriod,
                  })
                }
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Linked Target Milestone
            </label>
            <select
              value={value.linkedTargetId}
              onChange={(e) =>
                onChange({ ...value, linkedTargetId: e.target.value })
              }
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {targetMilestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Level {m.level})
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="flex gap-2 justify-end mt-auto">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-md transition-colors"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
