import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  useFetchLongTermsQuery,
  useFetchCyclesOfLongTermQuery,
  useFetchCategoriesFromCycleQuery,
  useFetchSubcategoriesFromCycleQuery,
  useFetchContentsFromCycleQuery,
  useFetchCurrentUserQuery,
  useCreateLongTermMutation,
  useDeleteLongTermMutation,
  useAddCycleMutation,
  useDeleteCycleMutation,
  useAddCategoryToCycleMutation,
  useAddSubcategoryToCycleMutation,
  useAddCategoryMutation,
  useAddSubcategoryMutation,
  useAddContentMutation,
  useAddContentToCycleMutation,
  store,
} from "../store";
import { cyclesApi } from "../store/apis/cyclesApi";
import CreationForm from "../components/CreationForm";
import Dropdown from "../components/Dropdown";
import { getLongTermHistoryOptions } from "../utils/utils";
import {
  LongTermItem,
  CycleItem,
  CycleCategoryItem,
  CycleSubcategoryItem,
  User,
} from "../types";
import Content from "../components/Content";
import { CycleItemContext, useCycleListContext } from "../context/cycle";
import { useLongTermContext } from "../context/longTerm";
import { BsPencilSquare } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { MdContentCopy } from "react-icons/md";

interface CreateLongTermProps {
  user: User;
}

interface DeleteLongTermProps {
  selectedLongTerm: LongTermItem;
  setSelectedLongTerm: (longTerm: LongTermItem | null) => void;
}

type DateValue = Date | null;

type CycleRange = DateValue | [DateValue, DateValue];

const CreateLongTerm: React.FC<CreateLongTermProps> = ({ user }) => {
  const [createLongTerm] = useCreateLongTermMutation();

  const [date, setDate] = useState<CycleRange>(null);
  const [expandCalendar, setExpandCalendar] = useState(false);

  const handleClick = () => {
    setExpandCalendar(!expandCalendar);
  };

  const handleSelectCycleRange = (e: CycleRange) => {
    setDate(e);
    setExpandCalendar(false);
  };

  useEffect(() => {
    if (Array.isArray(date)) {
      createLongTerm({
        userId: user.id,
        startTime: date[0],
        endTime: date[1],
      });
    }
  }, [date]);

  return (
    <div className="relative">
      <button onClick={handleClick}>
        <BsPencilSquare />
      </button>
      {expandCalendar && (
        <div className="absolute right-0 shadow-lg">
          <Calendar
            selectRange
            value={date}
            onChange={handleSelectCycleRange}
          />
        </div>
      )}
    </div>
  );
};

const DeleteLongTerm: React.FC<DeleteLongTermProps> = ({
  selectedLongTerm,
  setSelectedLongTerm,
}) => {
  const [deleteLongTerm] = useDeleteLongTermMutation();

  const handleClick = () => {
    deleteLongTerm({ id: String(selectedLongTerm.id) });
    setSelectedLongTerm(null);
  };

  return (
    <button onClick={handleClick}>
      <MdDelete />
    </button>
  );
};

export default function LongTerm() {
  const { data: userData } = useFetchCurrentUserQuery(null);
  const {
    data: longTermData,
    error: longTermError,
    isLoading: isLongTermLoading,
  } = useFetchLongTermsQuery(null);

  const { selectedLongTerm: longTerm, setSelectedLongTerm: setLongTerm } =
    useLongTermContext();
  const { setCycleList } = useCycleListContext();
  const {
    data: cycleData,
    error: cycleFetchError,
    isLoading: isCycleLoading,
  } = useFetchCyclesOfLongTermQuery(longTerm);

  useEffect(() => {
    setCycleList(cycleData);
  }, [cycleData]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        {longTermData && (
          <Dropdown
            options={getLongTermHistoryOptions(longTermData)}
            selectedItemId={longTerm && String(longTerm.id)}
            onSelect={setLongTerm}
          />
        )}
        <div className="flex space-x-2">
          <CreateLongTerm user={userData} />
          {longTerm && (
            <DeleteLongTerm
              selectedLongTerm={longTerm}
              setSelectedLongTerm={setLongTerm}
            />
          )}
        </div>
      </div>
      <div className="flex px-5 py-2">
        {longTerm && <CycleOptions longTerm={longTerm} />}
      </div>
    </div>
  );
}

interface ItemProps {
  cycle: CycleItem;
}

interface CycleOptionsProps {
  longTerm: LongTermItem;
}

const CycleOptions: React.FC<CycleOptionsProps> = ({ longTerm }) => {
  const { cycleList } = useCycleListContext();

  // Aggregate unique categories across all cycles
  const [topCategories, setTopCategories] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedTopCategoryId, setSelectedTopCategoryId] = useState<
    number | null
  >(null);

  // Aggregate unique subcategories for the selected category
  const [topSubcategories, setTopSubcategories] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedTopSubcategoryIds, setSelectedTopSubcategoryIds] = useState<
    number[]
  >([]);

  // Creation form toggles
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showNewSubcategoryForm, setShowNewSubcategoryForm] = useState(false);

  // Current user for creating categories
  const { data: currentUser } = useFetchCurrentUserQuery(null);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      if (!cycleList || cycleList.length === 0) {
        if (isMounted) setTopCategories([]);
        return;
      }

      const promises = cycleList.map((c) =>
        store.dispatch(cyclesApi.endpoints.fetchCategoriesFromCycle.initiate(c))
      );
      const results = await Promise.all(promises);
      const map = new Map<number, string>();
      results.forEach((res: any) => {
        const data: CycleCategoryItem[] = res?.data ?? [];
        data.forEach((cat) => {
          if (!map.has(cat.category_id)) map.set(cat.category_id, cat.name);
        });
      });
      if (isMounted) {
        setTopCategories(
          Array.from(map.entries()).map(([id, name]) => ({ id, name }))
        );
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [cycleList]);

  // When category changes, compute subcategories across cycles and reset selected subcategory
  useEffect(() => {
    let isMounted = true;
    const loadSubcategories = async () => {
      if (
        !cycleList ||
        cycleList.length === 0 ||
        selectedTopCategoryId == null
      ) {
        if (isMounted) {
          setTopSubcategories([]);
          setSelectedTopSubcategoryIds([]);
        }
        return;
      }

      const promises = cycleList.map((c) =>
        store.dispatch(
          cyclesApi.endpoints.fetchSubcategoriesFromCycle.initiate(c)
        )
      );
      const results = await Promise.all(promises);
      const map = new Map<number, string>();
      results.forEach((res: any) => {
        const data: CycleSubcategoryItem[] = res?.data ?? [];
        data.forEach((sub) => {
          if (
            sub.category_id === selectedTopCategoryId &&
            !map.has(sub.subcategory_id)
          ) {
            map.set(sub.subcategory_id, sub.name);
          }
        });
      });
      if (isMounted) {
        setTopSubcategories(
          Array.from(map.entries()).map(([id, name]) => ({ id, name }))
        );
        setSelectedTopSubcategoryIds([]);
      }
    };
    loadSubcategories();
    return () => {
      isMounted = false;
    };
  }, [cycleList, selectedTopCategoryId]);

  // Quick add cycle in All Cycles view
  const [addCycle] = useAddCycleMutation();
  const [showAddCalendar, setShowAddCalendar] = useState(false);

  // Mutations needed for copy
  const [addCategoryToCycle] = useAddCategoryToCycleMutation();
  const [addSubcategoryToCycle] = useAddSubcategoryToCycleMutation();
  const [addContentToCycle] = useAddContentToCycleMutation();

  // Copy logic reused by per-row calendar
  const copyCycleContents = async (
    fromCycle: CycleItem,
    toCycle: CycleItem
  ) => {
    const categoriesPromise = store.dispatch(
      cyclesApi.endpoints.fetchCategoriesFromCycle.initiate(fromCycle)
    );
    const subcategoriesPromise = store.dispatch(
      cyclesApi.endpoints.fetchSubcategoriesFromCycle.initiate(fromCycle)
    );
    const contentsPromise = store.dispatch(
      cyclesApi.endpoints.fetchContentsFromCycle.initiate(fromCycle)
    );

    const [categoriesRes, subcategoriesRes, contentsRes] = await Promise.all([
      categoriesPromise,
      subcategoriesPromise,
      contentsPromise,
    ]);

    const categories: CycleCategoryItem[] = categoriesRes.data ?? [];
    const subcategories: CycleSubcategoryItem[] = subcategoriesRes.data ?? [];
    const contents: any[] = contentsRes.data ?? [];

    for (const category of categories) {
      await addCategoryToCycle({
        cycleId: toCycle.id,
        categoryId: category.category_id,
      });
      const categorySubs = subcategories.filter(
        (s) => s.category_id === category.category_id
      );
      for (const sub of categorySubs) {
        await addSubcategoryToCycle({
          cycleId: toCycle.id,
          subcategoryId: sub.subcategory_id,
        });
        const subContents = contents.filter(
          (c) => c.subcategory_id === sub.subcategory_id
        );
        for (const content of subContents) {
          await addContentToCycle({
            cycleId: toCycle.id,
            contentId: content.content_id,
          });
        }
      }
    }
  };

  // New Cycle (top) calendar create only
  const handleSelectCycleRange = async (date: CycleRange) => {
    setShowAddCalendar(false);
    if (!Array.isArray(date)) return;
    await addCycle({
      longTermId: longTerm?.id,
      startTime: date[0],
      endTime: date[1],
    });
  };

  // Copy from a source row with provided date range
  const handleCopyWithRange = async (
    sourceCycle: CycleItem,
    date: CycleRange
  ) => {
    if (!Array.isArray(date)) return;
    const result: any = await addCycle({
      longTermId: longTerm?.id,
      startTime: date[0],
      endTime: date[1],
    });
    const newCycle: CycleItem | undefined = result?.data;
    if (newCycle) {
      await copyCycleContents(sourceCycle, newCycle);
    }
  };

  const [deleteCycle] = useDeleteCycleMutation();

  // Derive selected names for summary and row badges
  const selectedTopCategory =
    selectedTopCategoryId != null
      ? topCategories.find((tc) => tc.id === selectedTopCategoryId)
      : undefined;
  const selectedTopSubcategories = topSubcategories.filter((ts) =>
    selectedTopSubcategoryIds.includes(ts.id)
  );
  const selectedTopCategoryName = selectedTopCategory?.name ?? null;

  // Mutations for creating Category/Subcategory
  const [addCategory] = useAddCategoryMutation();
  const [addSubcategory] = useAddSubcategoryMutation();

  // Handlers to create new Category and Subcategory (reusing existing flows)
  const handleCreateCategory: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    if (!currentUser) return;
    const name = (
      e.currentTarget.elements.namedItem("name") as HTMLInputElement
    )?.value?.trim();
    if (!name) return;
    const result: any = await addCategory({ userId: currentUser.id, name });
    if (result && result.data) {
      const newCat = result.data as { id: number; name: string };
      setTopCategories((prev) =>
        prev.some((c) => c.id === newCat.id)
          ? prev
          : [...prev, { id: newCat.id, name: newCat.name }]
      );
      setSelectedTopCategoryId(newCat.id);
      setSelectedTopSubcategoryIds([]);
      setShowNewCategoryForm(false);
    }
  };

  const handleCreateSubcategory: React.FormEventHandler<
    HTMLFormElement
  > = async (e) => {
    e.preventDefault();
    if (selectedTopCategoryId == null) return;
    const name = (
      e.currentTarget.elements.namedItem("name") as HTMLInputElement
    )?.value?.trim();
    if (!name) return;
    const result: any = await addSubcategory({
      categoryId: String(selectedTopCategoryId),
      name,
    });
    if (result && result.data) {
      const newSub = result.data as { id: number; name: string };
      setTopSubcategories((prev) =>
        prev.some((s) => s.id === newSub.id)
          ? prev
          : [...prev, { id: newSub.id, name: newSub.name }]
      );
      setSelectedTopSubcategoryIds((prev) => [...prev, newSub.id]);
      setShowNewSubcategoryForm(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">
          {(cycleList?.length ?? 0) > 0
            ? `${cycleList?.length} cycle${
                (cycleList?.length ?? 0) > 1 ? "s" : ""
              }`
            : "No cycles yet"}
        </div>
        <div className="relative">
          <button
            type="button"
            className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setShowAddCalendar((v) => !v)}
          >
            New Cycle
          </button>
          {showAddCalendar && (
            <div className="absolute right-0 z-10 mt-2 shadow-lg">
              <Calendar selectRange onChange={handleSelectCycleRange} />
            </div>
          )}
        </div>
      </div>

      {/* Top category bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2">
        <span className="text-[11px] text-gray-500 shrink-0">Categories</span>
        {topCategories.map((tc) => {
          const active = selectedTopCategoryId === tc.id;
          return (
            <button
              key={tc.id}
              type="button"
              className={`whitespace-nowrap text-xs px-2 py-1 rounded-full border ${
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => {
                setSelectedTopCategoryId((prev) =>
                  prev === tc.id ? null : tc.id
                );
              }}
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
      {showNewCategoryForm && (
        <div className="mb-2">
          <CreationForm handleAddFunc={handleCreateCategory} />
        </div>
      )}

      {/* Top subcategory bar */}
      {
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2">
          <span className="text-[11px] text-gray-500 shrink-0">
            Subcategories
          </span>
          {topSubcategories.map((ts) => {
            const active = selectedTopSubcategoryIds.includes(ts.id);
            return (
              <button
                key={ts.id}
                type="button"
                className={`whitespace-nowrap text-xs px-2 py-1 rounded-full border ${
                  active
                    ? "bg-violet-600 text-white border-violet-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() =>
                  setSelectedTopSubcategoryIds((prev) =>
                    prev.includes(ts.id)
                      ? prev.filter((id) => id !== ts.id)
                      : [...prev, ts.id]
                  )
                }
                title={ts.name}
              >
                {ts.name}
              </button>
            );
          })}
          <button
            type="button"
            disabled={selectedTopCategoryId == null}
            className={`text-xs px-2 py-1 rounded-full border ${
              selectedTopCategoryId == null
                ? "border-gray-200 text-gray-300"
                : "border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() =>
              selectedTopCategoryId != null &&
              setShowNewSubcategoryForm((v) => !v)
            }
            title={
              selectedTopCategoryId == null
                ? "Select a category first"
                : "Create subcategory"
            }
          >
            + New
          </button>
        </div>
      }
      {showNewSubcategoryForm && selectedTopCategoryId != null && (
        <div className="mb-2">
          <CreationForm handleAddFunc={handleCreateSubcategory} />
        </div>
      )}

      {/* Selection breadcrumb */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs">
          {selectedTopCategoryName ? (
            <span className="px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
              {selectedTopCategoryName}
            </span>
          ) : (
            <span className="text-gray-400">Pick a category</span>
          )}
          {selectedTopCategoryName &&
            (selectedTopSubcategories.length > 0 ? (
              <>
                <span className="text-gray-400">›</span>

                <div className="flex items-center gap-1 flex-wrap">
                  {selectedTopSubcategories.map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-gray-400">Select subcategories</span>
            ))}
        </div>
      </div>

      {/* All Cycles rows */}
      <div className="flex flex-col gap-4">
        {cycleList?.map((c, index) => (
          <CycleCard
            key={c.id ?? index}
            cycle={c}
            index={index}
            onDelete={deleteCycle}
            onCopyWithRange={handleCopyWithRange}
            selectedTopCategoryId={selectedTopCategoryId}
            selectedTopSubcategoryIds={selectedTopSubcategoryIds}
            selectedTopSubcategories={selectedTopSubcategories}
          />
        ))}
      </div>
    </div>
  );
};

interface CycleCardProps {
  cycle: CycleItem;
  index: number;
  onDelete: (c: CycleItem) => void;
  onCopyWithRange: (source: CycleItem, range: CycleRange) => void;
  selectedTopCategoryId?: number | null;
  selectedTopSubcategoryIds?: number[];
  selectedTopSubcategories?: { id: number; name: string }[];
}

const CycleCard: React.FC<CycleCardProps> = ({
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

export const Items: React.FC<ItemProps> = ({
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
