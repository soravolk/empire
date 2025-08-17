import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { MdDelete } from "react-icons/md";
import { MdContentCopy } from "react-icons/md";
import CreationForm from "./CreationForm";
import Content from "./Content";
import {
  useFetchCategoriesFromCycleQuery,
  useFetchSubcategoriesFromCycleQuery,
  useFetchContentsFromCycleQuery,
  useAddCategoryToCycleMutation,
  useAddSubcategoryToCycleMutation,
  useAddContentMutation,
  useAddContentToCycleMutation,
} from "../store";
import { CycleItem, CycleCategoryItem, CycleSubcategoryItem } from "../types";
import { CycleItemContext } from "../context/cycle";

type DateValue = Date | null;
type CycleRange = DateValue | [DateValue, DateValue];

interface CycleProps {
  cycle: CycleItem;
  index: number;
  onDelete: (c: CycleItem) => void;
  onCopyWithRange: (source: CycleItem, range: CycleRange) => void;
  selectedTopCategoryId?: number | null;
  selectedTopSubcategoryIds?: number[];
  selectedTopSubcategories?: { id: number; name: string }[];
}

const Cycle: React.FC<CycleProps> = ({
  cycle,
  index,
  onDelete,
  onCopyWithRange,
  selectedTopCategoryId,
  selectedTopSubcategoryIds,
  selectedTopSubcategories,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showCopyCalendar, setShowCopyCalendar] = useState(false);

  // Auto-expand rows when category selected and at least one subcategory selected; collapse when both cleared
  useEffect(() => {
    if (
      selectedTopCategoryId != null &&
      (selectedTopSubcategoryIds?.length ?? 0) > 0
    ) {
      setExpanded(true);
    } else if (
      selectedTopCategoryId == null &&
      (selectedTopSubcategoryIds?.length ?? 0) === 0
    ) {
      setExpanded(false);
    }
  }, [selectedTopCategoryId, selectedTopSubcategoryIds]);

  const handleCopySelectRange = async (date: CycleRange) => {
    setShowCopyCalendar(false);
    await onCopyWithRange(cycle, date);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700">{`Cycle ${
          index + 1
        }`}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
          <div className="relative">
            <button
              type="button"
              aria-label="Copy cycle"
              className="text-gray-600 hover:text-gray-800"
              onClick={() => setShowCopyCalendar((v) => !v)}
              title="Copy cycle to new date range"
            >
              <MdContentCopy />
            </button>
            {showCopyCalendar && (
              <div className="absolute right-0 z-10 mt-2 shadow-lg">
                <Calendar selectRange onChange={handleCopySelectRange} />
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Delete cycle"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(cycle)}
          >
            <MdDelete />
          </button>
        </div>
      </div>
      {expanded ? (
        <CycleItemContext.Provider value={cycle}>
          <div className="flex gap-4">
            <Items
              cycle={cycle}
              selectedTopCategoryId={selectedTopCategoryId}
              selectedTopSubcategoryIds={selectedTopSubcategoryIds}
              selectedTopSubcategories={selectedTopSubcategories}
            />
          </div>
        </CycleItemContext.Provider>
      ) : (
        <div className="text-xs text-gray-500">
          Click Expand to view categories and tasks
        </div>
      )}
    </div>
  );
};

interface ItemProps {
  cycle: CycleItem;
  selectedTopCategoryId?: number | null;
  selectedTopSubcategoryIds?: number[];
  selectedTopSubcategories?: { id: number; name: string }[];
}

const Items: React.FC<ItemProps> = ({
  cycle,
  selectedTopCategoryId,
  selectedTopSubcategoryIds,
  selectedTopSubcategories,
}) => {
  const [category, setCategory] = useState<CycleCategoryItem | null>(null);

  useEffect(() => {
    setCategory(null);
  }, [cycle]);

  const {
    data: categoryData,
    error: categoryFetchError,
    isLoading: isCategoryLoading,
  } = useFetchCategoriesFromCycleQuery(cycle);
  const {
    data: subcategoryData,
    error: subcategoryFetchError,
    isLoading: isSubCategoryLoading,
  } = useFetchSubcategoriesFromCycleQuery(cycle);
  const {
    data: contentData,
    error: contentFetchError,
    isLoading: isContentLoading,
  } = useFetchContentsFromCycleQuery(cycle);

  const [addCategoryToCycle] = useAddCategoryToCycleMutation();
  const [addSubcategoryToCycle] = useAddSubcategoryToCycleMutation();
  const [addContent] = useAddContentMutation();
  const [addContentToCycle] = useAddContentToCycleMutation();

  // Sync from top selections
  useEffect(() => {
    if (!categoryData) return;
    if (selectedTopCategoryId == null) {
      setCategory(null);
      return;
    }
    const match =
      categoryData.find(
        (c: CycleCategoryItem) => c.category_id === selectedTopCategoryId
      ) || null;
    setCategory(match);
  }, [selectedTopCategoryId, categoryData]);

  const categoryMissing =
    selectedTopCategoryId != null &&
    categoryData &&
    !categoryData.some(
      (c: CycleCategoryItem) => c.category_id === selectedTopCategoryId
    );

  // Helper: list of selected subcategories present in this cycle
  const selectedSubsInCycle: CycleSubcategoryItem[] =
    (subcategoryData && selectedTopSubcategoryIds
      ? subcategoryData.filter((s: CycleSubcategoryItem) =>
          selectedTopSubcategoryIds.includes(s.subcategory_id)
        )
      : []) ?? [];

  // Helper: list of selected subcategory ids missing in this cycle
  const missingSelectedSubIds: number[] = (
    selectedTopSubcategoryIds || []
  ).filter(
    (id) =>
      !subcategoryData?.some(
        (s: CycleSubcategoryItem) => s.subcategory_id === id
      )
  );

  // Quick content creation per missing subcategory (supports multi-select)
  const [showQuickContentForms, setShowQuickContentForms] = useState<number[]>(
    []
  );
  const toggleQuickForm = (id: number) =>
    setShowQuickContentForms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleQuickCreateContent =
    (
      selectedTopSubcategoryId: number
    ): React.FormEventHandler<HTMLFormElement> =>
    async (e) => {
      e.preventDefault();
      if (selectedTopCategoryId == null || selectedTopSubcategoryId == null)
        return;
      const name = (
        e.currentTarget.elements.namedItem("name") as HTMLInputElement
      )?.value?.trim();
      if (!name) return;

      // Attach missing relations first
      if (categoryMissing) {
        await addCategoryToCycle({
          cycleId: cycle.id,
          categoryId: selectedTopCategoryId,
        });
      }
      const subcategoryMissing = !subcategoryData?.some(
        (s: CycleSubcategoryItem) =>
          s.subcategory_id === selectedTopSubcategoryId
      );
      if (subcategoryMissing) {
        await addSubcategoryToCycle({
          cycleId: cycle.id,
          subcategoryId: selectedTopSubcategoryId,
        });
      }

      // Create and attach content
      const result: any = await addContent({
        subcategoryId: String(selectedTopSubcategoryId),
        name,
      });
      if (result && result.data) {
        await addContentToCycle({
          cycleId: cycle.id,
          contentId: result.data.id,
        });
      }

      setShowQuickContentForms((prev) =>
        prev.filter((x) => x !== selectedTopSubcategoryId)
      );
    };

  const getSubName = (id: number) =>
    selectedTopSubcategories?.find((s) => s.id === id)?.name ||
    `Subcategory ${id}`;

  return (
    <div className="flex-1 min-w-0">
      {/* When selections are made but this cycle is missing some of them, show Add content per missing subcategory */}
      {selectedTopCategoryId != null &&
        (selectedTopSubcategoryIds?.length ?? 0) > 0 &&
        missingSelectedSubIds.length > 0 && (
          <div className="mb-3 space-y-2">
            {missingSelectedSubIds.map((id) => (
              <div key={id} className="">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    {getSubName(id)}
                  </span>
                  <button
                    type="button"
                    className="text-xs px-2 py-1 rounded border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => toggleQuickForm(id)}
                  >
                    Add content
                  </button>
                </div>
                {showQuickContentForms.includes(id) && (
                  <div className="mt-2">
                    <CreationForm
                      handleAddFunc={handleQuickCreateContent(id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {/* If category is set and content data available, render content for each selected subcategory present in this cycle */}
      {category && contentData && selectedSubsInCycle.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {selectedSubsInCycle.map((sub) => (
            <Content
              key={sub.subcategory_id}
              subcategory={sub}
              contents={contentData}
            />
          ))}
        </div>
      )}

      {/* Guidance and missing states */}
      {!category && selectedTopCategoryId != null && (
        <div className="text-xs text-gray-500">
          This cycle does not include the selected category.
        </div>
      )}
      {category &&
        (selectedTopSubcategoryIds?.length ?? 0) > 0 &&
        selectedSubsInCycle.length === 0 && (
          <div className="text-xs text-gray-500">
            This cycle does not include any of the selected subcategories.
          </div>
        )}
      {category && missingSelectedSubIds.length > 0 && (
        <div className="text-[11px] text-gray-500 mt-1">
          Missing in this cycle: {missingSelectedSubIds.length} selected
          subcategor{missingSelectedSubIds.length > 1 ? "ies" : "y"}.
        </div>
      )}
    </div>
  );
};

export default Cycle;
