import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  useFetchLongTermsQuery,
  useFetchCategoriesFromLongTermQuery,
  useFetchSubcategoriesFromLongTermQuery,
  useFetchCyclesOfLongTermQuery,
  useFetchCurrentUserQuery,
  useCreateLongTermMutation,
  useDeleteLongTermMutation,
  useAddCycleMutation,
  useDeleteCycleMutation,
  useAddSubcategoryToCycleMutation,
  useAddCategoryMutation,
  useAddSubcategoryMutation,
  useAddContentToCycleMutation,
  store,
} from "../store";
import { longTermsApi } from "../store/apis/longTermsApi";
import { cyclesApi } from "../store/apis/cyclesApi";
import Category from "../components/Category";
import SubCategory from "../components/Subcategory";
import Cycle from "../components/Cycle";
import Dropdown from "../components/Dropdown";
import { getLongTermHistoryOptions } from "../utils/utils";
import {
  LongTermItem,
  CycleItem,
  CycleCategoryItem,
  CycleSubcategoryItem,
  User,
} from "../types";
import { useCycleListContext } from "../context/cycle";
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

  // Current user for creating categories
  const { data: currentUser } = useFetchCurrentUserQuery(null);

  // Fetch categories across the entire long term once, then derive unique list
  const { data: longTermCategories } =
    useFetchCategoriesFromLongTermQuery(longTerm);
  useEffect(() => {
    if (!longTermCategories) {
      setTopCategories([]);
      return;
    }
    // category_id can repeat across cycles; build a unique list by category_id
    const map = new Map<number, string>();
    (longTermCategories as CycleCategoryItem[]).forEach((c) => {
      if (!map.has(c.category_id)) map.set(c.category_id, c.name);
    });
    setTopCategories(
      Array.from(map.entries()).map(([id, name]) => ({ id, name }))
    );
  }, [longTermCategories]);

  // When category changes, compute subcategories across the entire long term using the new endpoint
  const { data: longTermSubcategories } =
    useFetchSubcategoriesFromLongTermQuery(longTerm);
  useEffect(() => {
    if (selectedTopCategoryId == null || !longTermSubcategories) {
      setTopSubcategories([]);
      setSelectedTopSubcategoryIds([]);
      return;
    }
    const map = new Map<number, string>();
    (longTermSubcategories as CycleSubcategoryItem[])
      .filter((s) => s.category_id === selectedTopCategoryId)
      .forEach((s) => {
        if (!map.has(s.subcategory_id)) map.set(s.subcategory_id, s.name);
      });
    setTopSubcategories(
      Array.from(map.entries()).map(([id, name]) => ({ id, name }))
    );
    setSelectedTopSubcategoryIds([]);
  }, [longTermSubcategories, selectedTopCategoryId]);

  // Quick add cycle in All Cycles view
  const [addCycle] = useAddCycleMutation();
  const [showAddCalendar, setShowAddCalendar] = useState(false);

  // Mutations needed for copy
  const [addSubcategoryToCycle] = useAddSubcategoryToCycleMutation();
  const [addContentToCycle] = useAddContentToCycleMutation();

  // Copy logic reused by per-row calendar
  const copyCycleContents = async (
    fromCycle: CycleItem,
    toCycle: CycleItem
  ) => {
    const categoriesPromise = store.dispatch(
      longTermsApi.endpoints.fetchCategoriesFromLongTerm.initiate({
        id: fromCycle.long_term_id,
      })
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

    const categories: CycleCategoryItem[] = (categoriesRes.data ?? []).filter(
      (c: CycleCategoryItem) => c.cycle_id === fromCycle.id
    );
    const subcategories: CycleSubcategoryItem[] = subcategoriesRes.data ?? [];
    const contents: any[] = contentsRes.data ?? [];

    for (const category of categories) {
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
  // Creation callback passed to Category component
  const handleCreateCategory = async (name: string) => {
    if (!currentUser) return;
    const result: any = await addCategory({ userId: currentUser.id, name });
    if (result && result.data) {
      const newCat = result.data as { id: number; name: string };
      setTopCategories((prev) =>
        prev.some((c) => c.id === newCat.id)
          ? prev
          : [...prev, { id: newCat.id, name: newCat.name }]
      );
      setSelectedTopCategoryId(newCat.id);
      // Clear selected subcategories when switching to a new category
      setSelectedTopSubcategoryIds([]);
      return newCat;
    }
  };

  const handleCreateSubcategory = async (name: string) => {
    if (selectedTopCategoryId == null) return;
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
      return newSub;
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
      <Category
        categories={topCategories}
        selectedCategoryId={selectedTopCategoryId}
        onChangeSelected={setSelectedTopCategoryId}
        onCreate={handleCreateCategory}
      />
      {/* Top subcategory bar (reusable component) */}
      <SubCategory
        subcategories={topSubcategories}
        selectedIds={selectedTopSubcategoryIds}
        onChangeSelected={setSelectedTopSubcategoryIds}
        onCreate={handleCreateSubcategory}
      />

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
          <Cycle
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
