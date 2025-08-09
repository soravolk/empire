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
  const [selectedTopSubcategoryId, setSelectedTopSubcategoryId] = useState<
    number | null
  >(null);

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
          setSelectedTopSubcategoryId(null);
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
        setSelectedTopSubcategoryId(null);
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

  const handleSelectCycleRange = async (date: CycleRange) => {
    setShowAddCalendar(false);
    if (!Array.isArray(date)) return;
    await addCycle({
      longTermId: longTerm?.id,
      startTime: date[0],
      endTime: date[1],
    });
  };

  const [deleteCycle] = useDeleteCycleMutation();

  // Derive selected names for summary and row badges
  const selectedTopCategory =
    selectedTopCategoryId != null
      ? topCategories.find((tc) => tc.id === selectedTopCategoryId)
      : undefined;
  const selectedTopSubcategory =
    selectedTopSubcategoryId != null
      ? topSubcategories.find((ts) => ts.id === selectedTopSubcategoryId)
      : undefined;
  const selectedTopCategoryName = selectedTopCategory?.name ?? null;
  const selectedTopSubcategoryName = selectedTopSubcategory?.name ?? null;

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
      setSelectedTopSubcategoryId(null);
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
      setSelectedTopSubcategoryId(newSub.id);
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
            const active = selectedTopSubcategoryId === ts.id;
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
                  setSelectedTopSubcategoryId((prev) =>
                    prev === ts.id ? null : ts.id
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
            (selectedTopSubcategoryName ? (
              <>
                <span className="text-gray-400">›</span>
                <span className="px-2 py-0.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700">
                  {selectedTopSubcategoryName}
                </span>
              </>
            ) : (
              <span className="text-gray-400">Select a subcategory</span>
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
            selectedTopCategoryId={selectedTopCategoryId}
            selectedTopSubcategoryId={selectedTopSubcategoryId}
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
  selectedTopCategoryId?: number | null;
  selectedTopSubcategoryId?: number | null;
}

const CycleCard: React.FC<CycleCardProps> = ({
  cycle,
  index,
  onDelete,
  selectedTopCategoryId,
  selectedTopSubcategoryId,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Auto-expand rows only when both category and subcategory are selected; collapse when both cleared
  useEffect(() => {
    if (selectedTopCategoryId != null && selectedTopSubcategoryId != null) {
      setExpanded(true);
    } else if (
      selectedTopCategoryId == null &&
      selectedTopSubcategoryId == null
    ) {
      setExpanded(false);
    }
  }, [selectedTopCategoryId, selectedTopSubcategoryId]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700">
          {`Cycle ${index + 1}`}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
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
              selectedTopSubcategoryId={selectedTopSubcategoryId}
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
  selectedTopSubcategoryId?: number | null;
}

export const Items: React.FC<ItemProps> = ({
  cycle,
  selectedTopCategoryId,
  selectedTopSubcategoryId,
}) => {
  const [category, setCategory] = useState<CycleCategoryItem | null>(null);
  const [subcategory, setSubcategory] = useState<CycleSubcategoryItem | null>(
    null
  );

  useEffect(() => {
    setCategory(null);
    setSubcategory(null);
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
    setSubcategory(null);
  }, [selectedTopCategoryId, categoryData]);

  useEffect(() => {
    if (!subcategoryData) return;
    if (selectedTopSubcategoryId == null) {
      setSubcategory(null);
      return;
    }
    const match =
      subcategoryData.find(
        (s: CycleSubcategoryItem) =>
          s.subcategory_id === selectedTopSubcategoryId
      ) || null;
    setSubcategory(match);
  }, [selectedTopSubcategoryId, subcategoryData]);

  const categoryMissing =
    selectedTopCategoryId != null &&
    categoryData &&
    !categoryData.some(
      (c: CycleCategoryItem) => c.category_id === selectedTopCategoryId
    );

  const subcategoryMissing =
    selectedTopSubcategoryId != null &&
    subcategoryData &&
    !subcategoryData.some(
      (s: CycleSubcategoryItem) => s.subcategory_id === selectedTopSubcategoryId
    );

  // Quick content creation: attach selected category/subcategory only when creating content
  const [showQuickContentForm, setShowQuickContentForm] = useState(false);
  const handleQuickCreateContent: React.FormEventHandler<
    HTMLFormElement
  > = async (e) => {
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
      await addContentToCycle({ cycleId: cycle.id, contentId: result.data.id });
    }

    setShowQuickContentForm(false);
  };

  return (
    <div className="flex-1 min-w-0">
      {/* When selections are made but this cycle is missing them, allow content creation to auto-attach under the hood */}
      {selectedTopCategoryId != null &&
        selectedTopSubcategoryId != null &&
        (categoryMissing || subcategoryMissing) && (
          <div className="mb-2">
            <button
              type="button"
              className="text-xs px-2 py-1 rounded border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              onClick={() => setShowQuickContentForm((v) => !v)}
            >
              Add content
            </button>
            {showQuickContentForm && (
              <div className="mt-2">
                <CreationForm handleAddFunc={handleQuickCreateContent} />
              </div>
            )}
          </div>
        )}

      {/* If both category and subcategory are set and present, show that specific content */}
      {category && subcategory && contentData && (
        <Content subcategory={subcategory} contents={contentData} />
      )}

      {/* Removed category-only rendering to enforce both category and subcategory selection */}

      {!category && selectedTopCategoryId != null && (
        <div className="text-xs text-gray-500">
          This cycle does not include the selected category.
        </div>
      )}
      {category && selectedTopSubcategoryId != null && !subcategory && (
        <div className="text-xs text-gray-500">
          This cycle does not include the selected subcategory.
        </div>
      )}
    </div>
  );
};
