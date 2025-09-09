import { useMemo, useRef, useState } from "react";
import {
  useFetchGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useLinkCategoriesMutation,
  useUnlinkCategoriesMutation,
  useFetchCategoriesFromLongTermQuery,
} from "../store";
import { LongTermItem, User, CycleCategoryItem } from "../types";
import Goal from "./Goal";

interface GoalsSectionProps {
  longTerm: LongTermItem;
  user?: User;
}

const GoalsSection: React.FC<GoalsSectionProps> = ({ longTerm }) => {
  const {
    data: goals,
    isLoading,
    error,
  } = useFetchGoalsQuery(longTerm ? { longTermId: longTerm.id } : null);

  const { data: longTermCategories } =
    useFetchCategoriesFromLongTermQuery(longTerm);

  const uniqueCategories = useMemo(() => {
    const byId = new Map<number, string>();
    (longTermCategories as CycleCategoryItem[] | undefined)?.forEach((c) => {
      if (!byId.has(c.category_id)) byId.set(c.category_id, c.name);
    });
    return Array.from(byId.entries()).map(([id, name]) => ({ id, name }));
  }, [longTermCategories]);

  const [createGoal] = useCreateGoalMutation();
  const [updateGoal] = useUpdateGoalMutation();
  const [deleteGoal] = useDeleteGoalMutation();
  const [linkCategories] = useLinkCategoriesMutation();
  const [unlinkCategories] = useUnlinkCategoriesMutation();

  const [newText, setNewText] = useState("");
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [createError, setCreateError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleCreateCategory = (cid: number) => {
    setSelectedCatIds((prev) =>
      prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const statement = newText.trim().slice(0, 280);
    if (!statement) return;
    setBusy(true);
    setCreateError("");
    try {
      await createGoal({
        long_term_id: longTerm.id,
        statement,
        category_ids: selectedCatIds.length ? selectedCatIds : undefined,
      }).unwrap();
      setNewText("");
      setSelectedCatIds([]);
      // return focus to the input for quick entry of another goal
      inputRef.current?.focus();
    } catch (err: any) {
      const msg = err?.data?.message || err?.error || "Failed to add goal.";
      setCreateError(String(msg));
    } finally {
      setBusy(false);
    }
  };

  if (!longTerm) return null;

  return (
    <section className="w-full mb-4">
      <h2 className="text-base font-semibold text-gray-800 mb-2">Goals</h2>
      {isLoading && (
        <div className="text-sm text-gray-500" role="status" aria-live="polite">
          Loading goals…
        </div>
      )}
      {error && (
        <div
          className="text-sm text-red-600"
          role="alert"
          aria-live="assertive"
        >
          Failed to load goals.
        </div>
      )}

      {/* Empty state + creation */}
      {(!goals || goals.length === 0) && !isLoading && !error && (
        <div className="mb-3 text-sm text-gray-600">
          You don't have any goals yet. Create one below and optionally link to
          categories.
        </div>
      )}

      <form
        className="mb-3 flex flex-col gap-2"
        onSubmit={handleCreate}
        aria-describedby="new-goal-help"
      >
        <div className="flex gap-2 items-center">
          <label htmlFor="new-goal-input" className="sr-only">
            New goal
          </label>
          <input
            id="new-goal-input"
            ref={inputRef}
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder="Describe your goal (max 280 chars)"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            maxLength={280}
            disabled={busy}
            aria-invalid={!!createError}
            aria-describedby="new-goal-help new-goal-count"
          />
          <button
            type="submit"
            className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={busy || !newText.trim()}
            aria-busy={busy}
            aria-label="Add goal"
          >
            {busy ? "Adding…" : "Add Goal"}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <p id="new-goal-help" className="text-xs text-gray-500">
            Keep it concise. Max 280 characters.
          </p>
          <p id="new-goal-count" className="text-xs text-gray-500">
            {newText.length}/280
          </p>
        </div>
        {createError && (
          <div
            className="text-sm text-red-600"
            role="alert"
            aria-live="assertive"
          >
            {createError}
          </div>
        )}
        {uniqueCategories.length > 0 && (
          <fieldset
            className="flex items-center gap-2 flex-wrap"
            aria-label="Link to categories (optional)"
          >
            <legend className="sr-only">Link to categories (optional)</legend>
            {uniqueCategories.map((c) => {
              const active = selectedCatIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`text-xs px-2 py-1 rounded-full border ${
                    active
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleCreateCategory(c.id)}
                  aria-pressed={active}
                  aria-label={`${active ? "Unselect" : "Select"} category ${
                    c.name
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </fieldset>
        )}
      </form>

      {/* Goals list */}
      <div className="flex flex-col gap-3">
        {(goals ?? []).map((g) => (
          <Goal
            key={g.id}
            goal={g}
            categories={uniqueCategories}
            onUpdate={async (id, statement) => {
              await updateGoal({ id, statement }).unwrap();
            }}
            onDelete={async (id) => {
              await deleteGoal({ id }).unwrap();
            }}
            onLink={async (id, categoryIds) => {
              await linkCategories({ id, category_ids: categoryIds }).unwrap();
            }}
            onUnlink={async (id, categoryIds) => {
              await unlinkCategories({
                id,
                category_ids: categoryIds,
              }).unwrap();
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default GoalsSection;
