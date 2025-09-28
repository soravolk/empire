// Keep types aligned with other ShortTerm components
type TaskViewModel = {
  id: number;
  contentName: string;
  subcategoryId: number | "uncategorized";
  categoryId: number | "uncategorized";
  finishedDate?: string | null;
  timeSpent?: number;
};

type CategoryTasks = {
  categoryId: number | "uncategorized";
  categoryName: string;
  tasks: TaskViewModel[];
};

interface GroupedListByCategoryProps {
  categories: CategoryTasks[];
  onSelectTask: (taskId: number) => void;
}

/**
 * Renders an "All Tasks" view grouped by category.
 * Each category forms a vertical section separated by a horizontal rule.
 */
export default function GroupedListByCategory({
  categories,
  onSelectTask,
}: GroupedListByCategoryProps) {
  if (!categories || categories.length === 0) {
    return <div className="text-sm text-gray-500 p-4">No tasks available.</div>;
  }

  return (
    <div className="w-full">
      {categories.map((cat, ci) => (
        <section key={String(cat.categoryId)} className="py-2">
          <h3 className="text-sm font-semibold text-gray-800 px-2 mb-1">
            {cat.categoryName}
          </h3>
          {cat.tasks.length === 0 ? (
            <div className="text-xs text-gray-500 px-3 py-2">No tasks</div>
          ) : (
            <ul className="divide-y bg-white rounded-lg border">
              {cat.tasks.map((t) => (
                <li
                  key={t.id}
                  className="py-2 px-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectTask(t.id)}
                >
                  <span className="text-sm truncate inline-block max-w-full">
                    {t.contentName}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {ci < categories.length - 1 && (
            <hr className="my-3 border-gray-200" />
          )}
        </section>
      ))}
    </div>
  );
}
