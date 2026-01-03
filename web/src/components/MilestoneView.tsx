interface MilestoneViewProps {
  goalId: string;
}

export default function MilestoneView({ goalId }: MilestoneViewProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Milestones</h3>
      <p className="text-gray-600">Milestones for goal: {goalId}</p>
    </div>
  );
}
