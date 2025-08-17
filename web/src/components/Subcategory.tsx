import { useState } from "react";
import CreationForm from "./CreationForm";

type TopSubcategory = { id: number; name: string };

interface SubcategoryBarProps {
  subcategories: TopSubcategory[];
  selectedIds: number[];
  onChangeSelected: (next: number[]) => void;
  onCreate?: (
    name: string
  ) => Promise<TopSubcategory | void> | TopSubcategory | void;
}

// Reusable Top Subcategory Bar matching LongTerm's UI with multi-select
const SubCategory: React.FC<SubcategoryBarProps> = ({
  subcategories,
  selectedIds,
  onChangeSelected,
  onCreate,
}) => {
  const [showNewForm, setShowNewForm] = useState(false);

  const toggle = (id: number) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChangeSelected(next);
  };

  const handleSubmitNew: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    if (!onCreate) return;
    const name = (
      e.currentTarget.elements.namedItem("name") as HTMLInputElement
    )?.value?.trim();
    if (!name) return;
    onCreate(name);
    setShowNewForm(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2">
        <span className="text-[11px] text-gray-500 shrink-0">
          Subcategories
        </span>
        {subcategories.map((ts) => {
          const active = selectedIds.includes(ts.id);
          return (
            <button
              key={ts.id}
              type="button"
              className={`whitespace-nowrap text-xs px-2 py-1 rounded-full border ${
                active
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => toggle(ts.id)}
              title={ts.name}
            >
              {ts.name}
            </button>
          );
        })}
        {onCreate && (
          <button
            type="button"
            className={`text-xs px-2 py-1 rounded-full border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50`}
            onClick={() => setShowNewForm((v) => !v)}
            title="Create subcategory"
          >
            + New
          </button>
        )}
      </div>
      {onCreate && showNewForm && (
        <div className="mb-2">
          <CreationForm handleAddFunc={handleSubmitNew} />
        </div>
      )}
    </>
  );
};

export default SubCategory;
