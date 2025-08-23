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
  useAddCategoryMutation,
  useAddSubcategoryMutation,
  useAddContentToCycleMutation,
  useAddCategoryToLongTermMutation,
  useAddSubcategoryToLongTermMutation,
  useDeleteCategoryFromLongTermMutation,
  useDeleteSubcategoryFromLongTermMutation,
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

  // Fetch categories across the entire long term for the Category bar
  const { data: longTermCategories } =
    useFetchCategoriesFromLongTermQuery(longTerm);

  // When category changes, compute subcategories across the entire long term using the new endpoint
  const { data: longTermSubcategories } =
    useFetchSubcategoriesFromLongTermQuery(longTerm);
  useEffect(() => {
    if (selectedTopCategoryId == null || !longTermSubcategories) {
      setTopSubcategories([]);
      setSelectedTopSubcategoryIds([]);
      return;
    }
    setTopSubcategories(
      (longTermSubcategories as CycleSubcategoryItem[])
        .filter((s) => s.category_id === selectedTopCategoryId)
        .map((c) => ({
          id: c.subcategory_id,
          name: c.name,
        }))
    );
    setSelectedTopSubcategoryIds([]);
  }, [longTermSubcategories, selectedTopCategoryId]);

  // Quick add cycle in All Cycles view
  const [addCycle] = useAddCycleMutation();
  const [showAddCalendar, setShowAddCalendar] = useState(false);

  // Mutations needed for copy
  const [addSubcategoryToLongTerm] = useAddSubcategoryToLongTermMutation();
  const [deleteSubcategoryFromLongTerm] =
    useDeleteSubcategoryFromLongTermMutation();
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
        await addSubcategoryToLongTerm({
          longTermId: toCycle.long_term_id,
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
  const selectedTopSubcategories = topSubcategories.filter((ts) =>
    selectedTopSubcategoryIds.includes(ts.id)
  );
  const selectedTopCategoryName =
    selectedTopCategoryId != null
      ? (longTermCategories as CycleCategoryItem[] | undefined)?.find(
          (c) => c.category_id === selectedTopCategoryId
        )?.name ?? null
      : null;

  // Mutations for creating Category/Subcategory
  const [addCategory] = useAddCategoryMutation();
  const [addSubcategory] = useAddSubcategoryMutation();
  const [addCategoryToLongTerm] = useAddCategoryToLongTermMutation();
  const [deleteCategoryFromLongTerm] = useDeleteCategoryFromLongTermMutation();

  // Handlers to create new Category and Subcategory (reusing existing flows)
  // Creation callback passed to Category component
  const handleCreateCategory = async (name: string) => {
    if (!currentUser) return;
    const result: any = await addCategory({ userId: currentUser.id, name });
    if (result && result.data) {
      const newCat = result.data as { id: number; name: string };
      if (longTerm?.id) {
        await addCategoryToLongTerm({
          longTermId: longTerm.id,
          categoryId: newCat.id,
        });
      }
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
      if (longTerm?.id) {
        await addSubcategoryToLongTerm({
          longTermId: longTerm.id,
          subcategoryId: newSub.id,
        });
      }
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
        categories={(
          (longTermCategories as CycleCategoryItem[] | undefined) ?? []
        ).map((c) => ({ id: c.category_id, name: c.name }))}
        selectedCategoryId={selectedTopCategoryId}
        onChangeSelected={setSelectedTopCategoryId}
        onCreate={handleCreateCategory}
        onDeleteSelected={async () => {
          if (selectedTopCategoryId == null || !longTerm?.id) return;
          // Find a cycle_categories row id representing this top category association
          const categoriesData = (
            await store.dispatch(
              longTermsApi.endpoints.fetchCategoriesFromLongTerm.initiate(
                longTerm
              )
            )
          ).data as CycleCategoryItem[] | undefined;
          const row = categoriesData?.find(
            (c) => c.category_id === selectedTopCategoryId
          );
          if (!row) return;
          await deleteCategoryFromLongTerm(row.id);
          setSelectedTopCategoryId(null);
        }}
      />
      {/* Top subcategory bar (reusable component) */}
      <SubCategory
        subcategories={topSubcategories}
        selectedIds={selectedTopSubcategoryIds}
        onChangeSelected={setSelectedTopSubcategoryIds}
        onCreate={handleCreateSubcategory}
        onDeleteSelected={async () => {
          if (!longTerm?.id || selectedTopSubcategoryIds.length === 0) return;
          const subcategoriesData = (
            await store.dispatch(
              longTermsApi.endpoints.fetchSubcategoriesFromLongTerm.initiate(
                longTerm
              )
            )
          ).data as CycleSubcategoryItem[] | undefined;
          if (!subcategoriesData) return;
          // For each selected subcategory id, find one association row and delete it
          const rowsToDelete = selectedTopSubcategoryIds
            .map(
              (sid) =>
                subcategoriesData.find((s) => s.subcategory_id === sid)?.id
            )
            .filter((id): id is number => typeof id === "number");
          await Promise.all(
            rowsToDelete.map((id) => deleteSubcategoryFromLongTerm(id))
          );
          // Clear selection after deletion
          setSelectedTopSubcategoryIds([]);
        }}
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
