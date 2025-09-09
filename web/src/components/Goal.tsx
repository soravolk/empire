import { useMemo, useState } from "react";
import { MdDelete, MdLinkOff } from "react-icons/md";
import { BsPencilSquare, BsCheck2 } from "react-icons/bs";
import classNames from "classnames";
import { GoalItem } from "../types";

interface GoalProps {
  goal: GoalItem;
  categories: { id: number; name: string }[]; // available categories to link
  onUpdate: (id: number, statement: string) => Promise<void> | void;
  onDelete: (id: number) => Promise<void> | void;
  onLink: (id: number, categoryIds: number[]) => Promise<void> | void;
  onUnlink: (id: number, categoryIds: number[]) => Promise<void> | void;
}

const Goal: React.FC<GoalProps> = ({
  goal,
  categories,
  onUpdate,
  onDelete,
  onLink,
  onUnlink,
}) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(goal.statement);
  const [selectedCatId, setSelectedCatId] = useState<number | "">("");
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    const trimmed = text.trim().slice(0, 280);
    if (!trimmed || trimmed === goal.statement) {
      setEditing(false);
      return;
    }
    setBusy(true);
    await onUpdate(goal.id, trimmed);
    setBusy(false);
    setEditing(false);
  };

  const handleDelete = async () => {
    setBusy(true);
    await onDelete(goal.id);
    setBusy(false);
  };

  const handleLink = async () => {
    if (selectedCatId === "") return;
    setBusy(true);
    await onLink(goal.id, [Number(selectedCatId)]);
    setBusy(false);
    setSelectedCatId("");
  };

  const handleUnlink = async (cid: number) => {
    setBusy(true);
    await onUnlink(goal.id, [cid]);
    setBusy(false);
  };

  const catNameById = useMemo(() => {
    const m = new Map<number, string>();
    categories.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  return (
    <div className="flex flex-col gap-2 p-3 border rounded-md bg-white">
      <div className="flex items-start gap-2">
        {editing ? (
          <input
            className="flex-1 border rounded px-2 py-1 text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={280}
            disabled={busy}
            aria-label="Edit goal text"
          />
        ) : (
          <div className="flex-1 text-sm text-gray-900 break-words">
            {goal.statement}
          </div>
        )}
        <div className="flex items-center gap-2">
          {editing ? (
            <button
              type="button"
              className={classNames(
                "text-sm px-2 py-1 rounded border",
                busy ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50"
              )}
              onClick={handleSave}
              disabled={busy}
              title="Save"
              aria-label="Save goal"
            >
              <BsCheck2 />
            </button>
          ) : (
            <button
              type="button"
              className="text-sm px-2 py-1 rounded border hover:bg-gray-50"
              onClick={() => setEditing(true)}
              title="Edit"
              aria-label="Edit goal"
            >
              <BsPencilSquare />
            </button>
          )}
          <button
            type="button"
            className={classNames(
              "text-sm px-2 py-1 rounded border",
              busy
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-red-50 text-red-700 border-red-300"
            )}
            onClick={handleDelete}
            disabled={busy}
            title="Delete"
            aria-label="Delete goal"
          >
            <MdDelete />
          </button>
        </div>
      </div>

      {/* Linked category chips */}
      {Array.isArray(goal.category_ids) && goal.category_ids.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {goal.category_ids.map((cid) => (
            <span
              key={cid}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700"
              title="Unlink category"
            >
              {catNameById.get(cid) || `#${cid}`}
              <button
                type="button"
                className="ml-1 text-blue-700 hover:text-blue-900"
                onClick={() => handleUnlink(cid)}
                disabled={busy}
                aria-label={`Unlink category ${catNameById.get(cid) || cid}`}
                title="Unlink"
              >
                <MdLinkOff />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Link selector */}
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`goal-link-select-${goal.id}`}>
          Link category
        </label>
        <select
          className="text-sm border rounded px-2 py-1"
          id={`goal-link-select-${goal.id}`}
          value={selectedCatId}
          onChange={(e) =>
            setSelectedCatId(e.target.value ? Number(e.target.value) : "")
          }
          disabled={busy}
        >
          <option value="">Link category…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={classNames(
            "text-sm px-2 py-1 rounded border",
            selectedCatId === "" || busy
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-gray-50"
          )}
          onClick={handleLink}
          disabled={selectedCatId === "" || busy}
          aria-label="Link selected category"
        >
          Link
        </button>
      </div>
    </div>
  );
};

export default Goal;
