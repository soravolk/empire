import { useState } from "react";
import CreationForm from "./CreationForm";

type TopCategory = { id: number; name: string };

interface CategoryBarProps {
  categories: TopCategory[];
  selectedCategoryId: number | null;
  onChangeSelected: (id: number | null) => void;
  onCreate?: (name: string) => Promise<TopCategory | void> | TopCategory | void;
  label?: string;
}

// Reusable Top Category Bar matching LongTerm's UI
const Category: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onChangeSelected,
  onCreate,
}) => {
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);

  const handleSubmitNewCategory: React.FormEventHandler<
    HTMLFormElement
  > = async (e) => {
    e.preventDefault();
    if (!onCreate) return;
    const name = (
      e.currentTarget.elements.namedItem("name") as HTMLInputElement
    )?.value?.trim();
    if (!name) return;
    await onCreate(name);
    setShowNewCategoryForm(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2">
        <span className="text-[11px] text-gray-500 shrink-0">Categories</span>
        {categories.map((tc) => {
          const active = selectedCategoryId === tc.id;
          return (
            <button
              key={tc.id}
              type="button"
              className={`whitespace-nowrap text-xs px-2 py-1 rounded-full border ${
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => onChangeSelected(active ? null : tc.id)}
              title={tc.name}
            >
              {tc.name}
            </button>
          );
        })}
        <button
          type="button"
          className="text-xs px-2 py-1 rounded-full border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
          onClick={() => setShowNewCategoryForm((v) => !v)}
        >
          + New
        </button>
      </div>
      {onCreate && showNewCategoryForm && (
        <div className="mb-2">
          <CreationForm handleAddFunc={handleSubmitNewCategory} />
        </div>
      )}
    </>
  );
};

export default Category;
