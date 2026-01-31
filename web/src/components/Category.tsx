import { useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import CreationForm from "./CreationForm";

type TopCategory = { id: number; name: string };

interface CategoryBarProps {
  categories: TopCategory[];
  selectedCategoryId: number | null;
  onChangeSelected: (id: number | null) => void;
  onCreate?: (name: string) => Promise<TopCategory | void> | TopCategory | void;
  onModify?: (id: number, newName: string) => Promise<void> | void;
  label?: string;
  onDeleteSelected?: () => void;
}

// Reusable Top Category Bar matching LongTerm's UI
const Category: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategoryId,
  onChangeSelected,
  onCreate,
  onModify,
  onDeleteSelected,
}) => {
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [editingName, setEditingName] = useState("");

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

  const handleStartEdit = (category: TopCategory) => {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingName("");
  };

  const handleSaveEdit = async () => {
    if (!onModify || editingCategoryId === null) return;
    const trimmedName = editingName.trim();
    if (!trimmedName) return;

    await onModify(editingCategoryId, trimmedName);
    setEditingCategoryId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2">
        <span className="text-[11px] text-gray-500 shrink-0">Categories</span>

        {categories.map((tc) => {
          const active = selectedCategoryId === tc.id;
          const isEditing = editingCategoryId === tc.id;

          if (isEditing) {
            return (
              <div key={tc.id} className="flex items-center gap-1">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveEdit}
                  autoFocus
                  className="text-xs px-2 py-1 rounded-full border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  style={{ width: `${Math.max(editingName.length * 8, 60)}px` }}
                />
              </div>
            );
          }

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
              onDoubleClick={() => onModify && handleStartEdit(tc)}
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

        {selectedCategoryId != null && onModify && (
          <button
            type="button"
            className="ml-2 text-xs px-2 py-1 rounded-full border border-blue-300 text-blue-600 hover:bg-blue-50"
            onClick={() => {
              const category = categories.find(
                (c) => c.id === selectedCategoryId
              );
              if (category) handleStartEdit(category);
            }}
            title="Edit selected category"
          >
            <MdEdit />
          </button>
        )}
        {selectedCategoryId != null && onDeleteSelected && (
          <button
            type="button"
            className="ml-2 text-xs px-2 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50"
            onClick={onDeleteSelected}
            title="Remove selected category from long term"
          >
            <MdDelete />
          </button>
        )}
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
