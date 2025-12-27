import { useState, useEffect, useMemo } from "react";
import Dropdown from "../components/Dropdown";
import {
  CycleContentItem,
  CycleCategoryItem,
  CycleSubcategoryItem,
  CycleItem,
  LongTermItem,
  ShortTermItem,
  Task,
  Subtask,
  User,
} from "../types";
import {
  getAvailableCycleOptions,
  getAvailableShortTermOptions,
} from "../utils/utils";
import { BsPencilSquare } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { MdContentCopy } from "react-icons/md";
import {
  useCreateShortTermMutation,
  useFetchContentsFromCycleQuery,
  useFetchCurrentUserQuery,
  useFetchCyclesOfLongTermQuery,
  useFetchShortTermsQuery,
  useFetchCatetoryByIdQuery,
  useFetchSubcatetoryByIdQuery,
  useFetchContentFromCycleByIdQuery,
  useFetchTasksFromShortTermQuery,
  useCreateTaskMutation,
  useUpdateTimeSpentMutation,
  useUpdateFinishedDateMutation,
  useDeleteShortTermMutation,
  useDeleteShortTermTaskMutation,
  useFetchSubtasksFromTaskQuery,
  useCreateSubtaskMutation,
  useUpdateSubtaskTimeSpentMutation,
  useUpdateSubtaskFinishedDateMutation,
  useDeleteSubtaskMutation,
} from "../store";
import { useLongTermContext } from "../context/longTerm";
import { useShortTermContext } from "../context/shortTerm";
import { store } from "../store";
import { subtasksApi } from "../store/apis/subtasksApi";
import { cyclesApi } from "../store/apis/cyclesApi";
import { subcategoriesApi } from "../store/apis/subcategoriesApi";
import { categoriesApi } from "../store/apis/categoriesApi";
import CategoryCardsCarousel from "../components/shortTerm/CategoryCardsCarousel";
import GroupedListByCategory from "../components/shortTerm/GroupedListByCategory";
import RightEdgeDrawer from "../components/shortTerm/RightEdgeDrawer";

interface CreateShortTermProps {
  user: User;
}

interface DeleteShortTermProps {
  selectedShortTerm: ShortTermItem;
}

interface CopyShortTermProps {
  selectedShortTerm: ShortTermItem;
  user: User;
}

interface TaskCreationOverlayProps {
  shortTerm: ShortTermItem;
  selectedLongTerm: LongTermItem;
  toggleOverlay: () => void;
  tasks: Task[];
}

interface TaskItemInfoProps {
  task: Task;
  shortTerm: ShortTermItem;
}
interface TaskViewProps {
  toggleOverlay: () => void;
  shortTerm: ShortTermItem;
  tasks: Task[];
}

interface DeleteTaskItemProps {
  task: Task;
  shortTerm: ShortTermItem;
}

const CreateShortTerm: React.FC<CreateShortTermProps> = ({ user }) => {
  const [createShortTerm] = useCreateShortTermMutation();

  const handleClick = () => {
    createShortTerm({ userId: user.id });
  };

  return (
    <button onClick={handleClick}>
      <BsPencilSquare />
    </button>
  );
};

const DeleteShortTerm: React.FC<DeleteShortTermProps> = ({
  selectedShortTerm,
}) => {
  const [removeShortTerm] = useDeleteShortTermMutation();

  const handleClick = () => {
    removeShortTerm({ id: String(selectedShortTerm.id) });
  };

  return (
    <button onClick={handleClick}>
      <MdDelete />
    </button>
  );
};

const CopyShortTerm: React.FC<CopyShortTermProps> = ({
  selectedShortTerm,
  user,
}) => {
  const [createShortTerm] = useCreateShortTermMutation();
  const [createTask] = useCreateTaskMutation();
  const [createSubtask] = useCreateSubtaskMutation();
  const [updateSubtaskTimeSpent] = useUpdateSubtaskTimeSpentMutation();
  const [updateSubtaskFinishedDate] = useUpdateSubtaskFinishedDateMutation();
  const { data: tasks } = useFetchTasksFromShortTermQuery({
    shortTermId: selectedShortTerm.id,
  });

  const handleCopy = async () => {
    if (!tasks) {
      throw new Error("Failed to create new short term");
    }

    const newShortTermResult = await createShortTerm({ userId: user.id });
    if (!("data" in newShortTermResult) || !newShortTermResult.data) {
      throw new Error("Failed to create new short term");
    }
    const newShortTerm = newShortTermResult.data;

    // Copy tasks and their subtasks for the new short term
    for (const task of tasks) {
      const newTaskResult: any = await createTask({
        contentId: String(task.content_id),
        shortTermId: String(newShortTerm.id),
      });
      const newTask = newTaskResult?.data;

      // Fetch subtasks for the original task imperatively
      const subtasksResult: any = await store.dispatch(
        subtasksApi.endpoints.fetchSubtasksFromTask.initiate({
          taskId: task.id,
        })
      );
      const originalSubtasks: Subtask[] = subtasksResult?.data ?? [];

      for (const s of originalSubtasks) {
        try {
          await createSubtask({
            taskId: String(newTask.id),
            name: s.name,
            description: s.description || undefined,
          });
        } catch (e) {
          console.error("Failed to copy subtask", e);
        }
      }
    }
  };

  return (
    <button onClick={handleCopy} title="Copy short term">
      <MdContentCopy />
    </button>
  );
};

export default function ShortTerm() {
  const { selectedLongTerm } = useLongTermContext();
  const { selectedShortTerm: shortTerm, setSelectedShortTerm: setShortTerm } =
    useShortTermContext();
  const { data: userData } = useFetchCurrentUserQuery(null);
  const { data: shortTermData } = useFetchShortTermsQuery(null);
  const { data: tasks } = useFetchTasksFromShortTermQuery({
    shortTermId: shortTerm?.id,
  });

  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "all">("cards");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Prefetch lookup maps for content → subcategory → category to enable grouping
  const [contentMap, setContentMap] = useState<
    Record<number, CycleContentItem>
  >({});
  const [subcategoryMap, setSubcategoryMap] = useState<
    Record<number, CycleSubcategoryItem>
  >({});
  const [categoryMap, setCategoryMap] = useState<
    Record<number, CycleCategoryItem>
  >({});

  // Refetch trigger to force reload when data might be stale
  const [refetchKey, setRefetchKey] = useState(0);

  // Clear cache maps when window gains focus or short term changes to pick up any updates
  useEffect(() => {
    const handleFocus = () => {
      setCategoryMap({});
      setSubcategoryMap({});
      setContentMap({});
      setRefetchKey((prev) => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Clear cache maps when short term selection changes
  useEffect(() => {
    setCategoryMap({});
    setSubcategoryMap({});
    setContentMap({});
    setRefetchKey((prev) => prev + 1);
  }, [shortTerm?.id]);

  useEffect(() => {
    const loadLookups = async () => {
      if (!tasks || tasks.length === 0) return;
      // 1) Prefetch contents by id
      const contentIds: number[] = Array.from(
        new Set<number>(tasks.map((t: Task) => t.content_id))
      ).filter((id) => !(id in contentMap));
      const fetchedContents: Record<number, CycleContentItem> = {} as any;
      if (contentIds.length > 0) {
        const results = await Promise.all(
          contentIds.map((id) =>
            store
              .dispatch(
                cyclesApi.endpoints.fetchContentFromCycleById.initiate({ id })
              )
              .unwrap()
              .catch(() => undefined)
          )
        );
        results.forEach((arr) => {
          const c = Array.isArray(arr)
            ? (arr[0] as CycleContentItem | undefined)
            : undefined;
          if (c) fetchedContents[c.id] = c;
        });
      }

      const mergedContentMap = { ...contentMap, ...fetchedContents };

      // 2) Prefetch subcategories referenced by the fetched contents
      const subcategoryIds: number[] = Array.from(
        new Set<number>(
          Object.values(mergedContentMap).map((c) => c.subcategory_id)
        )
      ).filter((sid) => !(sid in subcategoryMap));
      const fetchedSubcategories: Record<number, CycleSubcategoryItem> =
        {} as any;
      if (subcategoryIds.length > 0) {
        const subResults = await Promise.all(
          subcategoryIds.map((id) =>
            store
              .dispatch(
                subcategoriesApi.endpoints.fetchSubcatetoryById.initiate({ id })
              )
              .unwrap()
              .catch(() => undefined)
          )
        );
        subResults.forEach((arr) => {
          const s = Array.isArray(arr)
            ? (arr[0] as CycleSubcategoryItem | undefined)
            : undefined;
          if (s) fetchedSubcategories[s.id] = s;
        });
      }
      const mergedSubcategoryMap = {
        ...subcategoryMap,
        ...fetchedSubcategories,
      };

      // 3) Prefetch categories referenced by subcategories
      const categoryIds: number[] = Array.from(
        new Set<number>(
          Object.values(mergedSubcategoryMap).map((s) => s.category_id)
        )
      ).filter((cid) => !(cid in categoryMap));
      const fetchedCategories: Record<number, CycleCategoryItem> = {} as any;
      if (categoryIds.length > 0) {
        const catResults = await Promise.all(
          categoryIds.map((id) =>
            store
              .dispatch(
                categoriesApi.endpoints.fetchCatetoryById.initiate({ id })
              )
              .unwrap()
              .catch(() => undefined)
          )
        );
        catResults.forEach((arr) => {
          const cat = Array.isArray(arr)
            ? (arr[0] as CycleCategoryItem | undefined)
            : undefined;
          if (cat) fetchedCategories[cat.category_id || cat.id] = cat as any;
        });
      }

      // Commit to state once per stage to reduce renders
      if (Object.keys(fetchedContents).length)
        setContentMap((m) => ({ ...m, ...fetchedContents }));
      if (Object.keys(fetchedSubcategories).length)
        setSubcategoryMap((m) => ({ ...m, ...fetchedSubcategories }));
      if (Object.keys(fetchedCategories).length)
        setCategoryMap((m) => ({ ...m, ...fetchedCategories }));
    };

    loadLookups();
  }, [tasks, refetchKey]);

  // Memoized grouping for Category Cards view (category → subcategory → tasks)
  const categoryCardsData = useMemo(() => {
    if (!tasks || tasks.length === 0)
      return [] as Array<{
        categoryId: number;
        categoryName: string;
        groups: Array<{
          id: number;
          name: string;
          tasks: Array<{
            id: number;
            contentName: string;
            subcategoryId: number;
            categoryId: number;
          }>;
        }>;
      }>;

    const byCategory: Record<
      string,
      {
        categoryId: number;
        categoryName: string;
        groups: Record<string, { id: number; name: string; tasks: any[] }>;
      }
    > = {};

    for (const t of tasks) {
      const content = contentMap[t.content_id];
      if (!content) continue; // skip until lookup is ready
      const subId = content.subcategory_id;
      const sub = subcategoryMap[subId];
      if (!sub) continue; // skip until lookup is ready
      const catId = sub.category_id;
      const cat = categoryMap[catId];
      if (!cat) continue; // skip until lookup is ready

      const categoryKey = String(catId);
      if (!byCategory[categoryKey]) {
        byCategory[categoryKey] = {
          categoryId: catId,
          categoryName:
            cat?.name || (cat as any)?.category_name || `Category ${catId}`,
          groups: {},
        };
      }

      const groupKey = String(subId);
      if (!byCategory[categoryKey].groups[groupKey]) {
        byCategory[categoryKey].groups[groupKey] = {
          id: subId,
          name: sub?.name || "Unknown subcategory",
          tasks: [],
        };
      }

      byCategory[categoryKey].groups[groupKey].tasks.push({
        id: t.id,
        contentName: content?.name || t.name || "Unknown content",
        subcategoryId: subId,
        categoryId: catId,
      });
    }

    // Convert nested records to sorted arrays
    const result = Object.values(byCategory)
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
      .map((c) => ({
        categoryId: c.categoryId,
        categoryName: c.categoryName,
        groups: Object.values(c.groups)
          .sort((g1, g2) => g1.name.localeCompare(g2.name))
          .map((g) => ({
            id: g.id,
            name: g.name,
            tasks: g.tasks.sort((t1, t2) =>
              t1.contentName.localeCompare(t2.contentName)
            ),
          })),
      }));

    return result;
  }, [tasks, contentMap, subcategoryMap, categoryMap]);

  // Memoized grouping for All Tasks view (category → tasks)
  const allTasksByCategory = useMemo(() => {
    if (!tasks || tasks.length === 0)
      return [] as Array<{
        categoryId: number;
        categoryName: string;
        tasks: Array<{
          id: number;
          contentName: string;
          subcategoryId: number;
          categoryId: number;
        }>;
      }>;

    const map: Record<
      string,
      {
        categoryId: number;
        categoryName: string;
        tasks: any[];
      }
    > = {};
    for (const t of tasks) {
      const content = contentMap[t.content_id];
      if (!content) continue;
      const subId = content.subcategory_id;
      const sub = subcategoryMap[subId];
      if (!sub) continue;
      const catId = sub.category_id;
      const cat = categoryMap[catId];
      if (!cat) continue;

      const key = String(catId);
      if (!map[key]) {
        map[key] = {
          categoryId: catId,
          categoryName:
            cat?.name || (cat as any)?.category_name || `Category ${catId}`,
          tasks: [],
        };
      }
      map[key].tasks.push({
        id: t.id,
        contentName: content?.name || t.name || "Unknown content",
        subcategoryId: subId,
        categoryId: catId,
      });
    }
    return Object.values(map)
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
      .map((c) => ({
        ...c,
        tasks: c.tasks.sort((t1, t2) =>
          t1.contentName.localeCompare(t2.contentName)
        ),
      }));
  }, [tasks, contentMap, subcategoryMap, categoryMap]);

  const toggleOverlay = () => {
    setOverlayVisible(!isOverlayVisible);
  };

  const openDetails = (taskId: number) => {
    setSelectedTaskId(taskId);
    setDrawerOpen(true);
  };

  const closeDetails = () => setDrawerOpen(false);

  const selectedTask = useMemo(() => {
    return tasks?.find((t: Task) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4 z-50">
        <div>
          {shortTermData && (
            <Dropdown
              options={getAvailableShortTermOptions(shortTermData)}
              selectedItemId={shortTerm && String(shortTerm.id)}
              onSelect={setShortTerm}
            />
          )}
        </div>
        {selectedLongTerm && (
          <div>
            Long Term: {selectedLongTerm.start_time.toString()} ~{" "}
            {selectedLongTerm.end_time.toString()}
          </div>
        )}
        <div className="flex space-x-2">
          <CreateShortTerm user={userData} />
          {shortTerm && (
            <>
              <CopyShortTerm selectedShortTerm={shortTerm} user={userData} />
              <DeleteShortTerm selectedShortTerm={shortTerm} />
            </>
          )}
        </div>
      </div>
      <div className="px-5 py-2 relative z-0">
        <div className="flex items-center justify-between mb-3">
          <div
            className="inline-flex rounded-md shadow-sm"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1 text-sm border rounded-l ${
                viewMode === "cards"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`px-3 py-1 text-sm border rounded-r -ml-px ${
                viewMode === "all"
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              All Tasks
            </button>
          </div>
          <button
            onClick={toggleOverlay}
            className="ml-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          >
            Add Tasks
          </button>
        </div>
        {shortTerm &&
          tasks &&
          (viewMode === "cards" ? (
            <CategoryCardsCarousel
              categories={categoryCardsData}
              onSelectTask={openDetails}
            />
          ) : (
            <GroupedListByCategory
              categories={allTasksByCategory}
              onSelectTask={openDetails}
            />
          ))}
      </div>

      <RightEdgeDrawer
        isOpen={isDrawerOpen}
        onClose={closeDetails}
        title="Task Details"
      >
        {shortTerm && selectedTask ? (
          <TaskItemInfo shortTerm={shortTerm} task={selectedTask} />
        ) : (
          <div className="text-gray-600 text-sm">
            Select a task to view details.
          </div>
        )}
      </RightEdgeDrawer>
      {isOverlayVisible && shortTerm && selectedLongTerm && (
        <TaskCreationOverlay
          shortTerm={shortTerm}
          selectedLongTerm={selectedLongTerm}
          toggleOverlay={toggleOverlay}
          tasks={tasks}
        />
      )}
    </div>
  );
}

const TaskView = ({ toggleOverlay, shortTerm, tasks }: TaskViewProps) => {
  const [selectedTaskItem, setSelectedTaskItem] = useState<Task | null>(null);

  return (
    <div className="flex w-full h-full">
      <div className="w-1/2 border-r p-4">
        <h2 className="font-bold mb-4">All Tasks</h2>
        <div className="mb-4">
          <ul>
            {tasks.map((item: Task, idx: number) => (
              <TaskListItem
                key={item.id}
                item={item}
                isSelected={selectedTaskItem?.id === item.id}
                onSelect={() => setSelectedTaskItem(item)}
              />
            ))}
          </ul>
        </div>
        <div>
          <button
            onClick={toggleOverlay}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Select Tasks
          </button>
        </div>
      </div>
      <div className="w-1/2 p-4">
        {selectedTaskItem ? (
          <TaskItemInfo shortTerm={shortTerm} task={selectedTaskItem} />
        ) : (
          <div className="text-gray-500">
            Select a task to view its information.
          </div>
        )}
      </div>
    </div>
  );
};

// Add this new component to fetch and display content name
const TaskListItem = ({
  item,
  isSelected,
  onSelect,
}: {
  item: Task;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const { data: content, isLoading } = useFetchContentFromCycleByIdQuery({
    id: item.content_id,
  });

  return (
    <li
      className={`cursor-pointer p-2 rounded bg-gray-100 hover:bg-gray-200 mt-2 ${
        isSelected && "bg-gray-200"
      }`}
      onClick={onSelect}
    >
      {isLoading ? "Loading..." : content?.[0]?.name || "Unknown content"}
    </li>
  );
};

const TaskItemInfo = ({ shortTerm, task }: TaskItemInfoProps) => {
  // TODO: need to refactor: 1. too many rerender, 2. flaky logic to display information and error handling
  const { data: content, isLoading: isContentLoading } =
    useFetchContentFromCycleByIdQuery({
      id: task.content_id,
    });
  const {
    data: subcategory,
    error: subcatetoryFetchError,
    isLoading: isSubcategoryLoading,
  } = useFetchSubcatetoryByIdQuery({
    id: content ? content[0].subcategory_id : undefined,
  });
  const {
    data: category,
    error: catetoryFetchError,
    isLoading: isCategoryLoading,
  } = useFetchCatetoryByIdQuery({
    id: subcategory ? subcategory[0].category_id : undefined,
  });

  const { data: subtasks } = useFetchSubtasksFromTaskQuery({
    taskId: task.id,
  });

  const [updateTimeSpent] = useUpdateTimeSpentMutation();
  const [updateFinishedDate] = useUpdateFinishedDateMutation();
  const [timeSpent, setTimeSpent] = useState(task.time_spent);
  const [finished, setFinished] = useState<boolean>(false);

  // Subtask creation state
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [newSubtaskDescription, setNewSubtaskDescription] = useState("");
  const [createSubtask] = useCreateSubtaskMutation();

  const calculatedTimeFromSubtasks =
    subtasks?.reduce(
      (total: number, subtask: Subtask) => total + (subtask.time_spent || 0),
      0
    ) || 0;
  const hasSubtasks = subtasks && subtasks.length > 0;

  useEffect(() => {
    const effectiveTimeSpent = hasSubtasks
      ? calculatedTimeFromSubtasks
      : task.time_spent;
    setTimeSpent(effectiveTimeSpent);
    setFinished(task.finished_date != null);

    if (hasSubtasks) {
      updateTimeSpent({
        id: String(task.id),
        timeSpent: calculatedTimeFromSubtasks,
      });
    }
  }, [task, calculatedTimeFromSubtasks, hasSubtasks]);

  const [isEditing, setIsEditing] = useState(false);

  const handleTimeSpentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasSubtasks) return;

    const newTimeSpent = parseInt(e.target.value) || 0;
    setTimeSpent(newTimeSpent);
    setIsEditing(true);
  };

  const handleConfirmTimeSpent = () => {
    updateTimeSpent({ id: String(task.id), timeSpent });
    setIsEditing(false);
  };

  const handleCancelTimeSpent = () => {
    setTimeSpent(task.time_spent || 0);
    setIsEditing(false);
  };

  const handleFinish = () => {
    updateFinishedDate({
      id: String(task.id),
      finishedDate: new Date().toISOString(),
    });
    setFinished(true);
  };

  const handleUnfinish = () => {
    updateFinishedDate({ id: String(task.id), finishedDate: null });
    setFinished(false);
  };

  const handleCreateSubtask = async () => {
    if (!newSubtaskName.trim()) return;

    try {
      await createSubtask({
        taskId: String(task.id),
        name: newSubtaskName,
        description: newSubtaskDescription || undefined,
      });
      setNewSubtaskName("");
      setNewSubtaskDescription("");
      setIsCreatingSubtask(false);
    } catch (error) {
      console.error("Error creating subtask:", error);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <div>
        <span className="font-semibold">Category:</span>
        {isCategoryLoading || catetoryFetchError ? (
          <span>Loading...</span>
        ) : (
          category[0].name
        )}
      </div>
      <div>
        <span className="font-semibold">Subcategory:</span>{" "}
        {isSubcategoryLoading || subcatetoryFetchError ? (
          <span>Loading...</span>
        ) : (
          subcategory[0].name
        )}
      </div>
      <div>
        <span className="font-semibold">Content:</span>
        {isContentLoading ? <span>Loading...</span> : content[0].name}
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Time Spent (minutes)
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            value={timeSpent}
            onChange={handleTimeSpentChange}
            disabled={hasSubtasks}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              hasSubtasks ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
          {isEditing && !hasSubtasks && (
            <div className="flex space-x-2 mt-1">
              <button
                onClick={handleConfirmTimeSpent}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                ✓
              </button>
              <button
                onClick={handleCancelTimeSpent}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Subtasks</h4>
          <button
            onClick={() => setIsCreatingSubtask(true)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Add Subtask
          </button>
        </div>

        {/* Create subtask form */}
        {isCreatingSubtask && (
          <div className="mb-4 p-3 border rounded-lg bg-gray-50">
            <input
              type="text"
              placeholder="Subtask name"
              value={newSubtaskName}
              onChange={(e) => setNewSubtaskName(e.target.value)}
              className="w-full mb-2 px-3 py-2 border rounded-md"
            />
            <textarea
              placeholder="Description (optional)"
              value={newSubtaskDescription}
              onChange={(e) => setNewSubtaskDescription(e.target.value)}
              className="w-full mb-2 px-3 py-2 border rounded-md"
              rows={2}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreateSubtask}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreatingSubtask(false);
                  setNewSubtaskName("");
                  setNewSubtaskDescription("");
                }}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Subtasks list */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {subtasks?.map((subtask: Subtask) => (
            <SubtaskItem key={subtask.id} subtask={subtask} />
          ))}
          {!subtasks?.length && !isCreatingSubtask && (
            <p className="text-gray-500 text-sm">No subtasks yet</p>
          )}
        </div>
      </div>

      <div className="flex mt-4 justify-between">
        {finished ? (
          <button
            className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
            onClick={handleUnfinish}
          >
            Unfinish
          </button>
        ) : (
          <button
            className="rounded bg-green-500 px-2 py-1 text-white hover:bg-green-600"
            onClick={handleFinish}
          >
            Finish
          </button>
        )}
        <DeleteTaskItem shortTerm={shortTerm} task={task} />
      </div>
    </div>
  );
};

// SubtaskItem component for displaying and managing individual subtasks
const SubtaskItem = ({ subtask }: { subtask: Subtask }) => {
  const [updateSubtaskTimeSpent] = useUpdateSubtaskTimeSpentMutation();
  const [updateSubtaskFinishedDate] = useUpdateSubtaskFinishedDateMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();

  const [timeSpent, setTimeSpent] = useState(subtask.time_spent);
  const [isEditing, setIsEditing] = useState(false);
  const [finished, setFinished] = useState(subtask.finished_date != null);

  useEffect(() => {
    setTimeSpent(subtask.time_spent);
    setFinished(subtask.finished_date != null);
  }, [subtask]);

  const handleTimeSpentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeSpent = parseInt(e.target.value) || 0;
    setTimeSpent(newTimeSpent);
    setIsEditing(true);
  };

  const handleConfirmTimeSpent = () => {
    updateSubtaskTimeSpent({
      id: String(subtask.id),
      timeSpent,
    });
    setIsEditing(false);
  };

  const handleCancelTimeSpent = () => {
    setTimeSpent(subtask.time_spent);
    setIsEditing(false);
  };

  const handleToggleFinished = () => {
    const finishedDate = finished ? null : new Date().toISOString();
    updateSubtaskFinishedDate({
      id: String(subtask.id),
      finishedDate,
    });
    setFinished(!finished);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this subtask?")) {
      deleteSubtask({ id: String(subtask.id) });
    }
  };

  return (
    <div
      className={`p-3 border rounded-lg ${
        finished ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={finished}
              onChange={handleToggleFinished}
              className="rounded"
            />
            <h5
              className={`font-medium ${
                finished ? "line-through text-gray-500" : ""
              }`}
            >
              {subtask.name}
            </h5>
          </div>
          {subtask.description && (
            <p
              className={`text-sm text-gray-600 mb-2 ${
                finished ? "line-through" : ""
              }`}
            >
              {subtask.description}
            </p>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              value={timeSpent}
              onChange={handleTimeSpentChange}
              className="w-20 px-2 py-1 text-sm border rounded"
              placeholder="mins"
            />
            <span className="text-sm text-gray-500">minutes</span>
            {isEditing && (
              <div className="flex space-x-1">
                <button
                  onClick={handleConfirmTimeSpent}
                  className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancelTimeSpent}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="ml-2 text-red-500 hover:text-red-700"
        >
          <MdDelete />
        </button>
      </div>
    </div>
  );
};

const DeleteTaskItem = ({ shortTerm, task }: DeleteTaskItemProps) => {
  const [removeShortTerm] = useDeleteShortTermTaskMutation();

  const handleClick = () => {
    removeShortTerm({
      id: String(shortTerm.id),
      taskId: String(task.id),
    });
  };

  return (
    <button onClick={handleClick}>
      <MdDelete />
    </button>
  );
};

const TaskCreationOverlay = ({
  shortTerm,
  selectedLongTerm,
  toggleOverlay,
  tasks,
}: TaskCreationOverlayProps) => {
  const [selectedCycle, setSelectedCycle] = useState<CycleItem | null>(null);

  const { data: cycleData } = useFetchCyclesOfLongTermQuery(selectedLongTerm);
  const { data: contentData } = useFetchContentsFromCycleQuery(selectedCycle);
  const [addTask] = useCreateTaskMutation();
  const [removeTask] = useDeleteShortTermTaskMutation();

  const handleCycleSelect = (cycle: CycleItem) => {
    setSelectedCycle(cycle);
  };

  const handleContentSelect = async (content: CycleContentItem) => {
    try {
      await addTask({
        contentId: String(content.id),
        shortTermId: String(shortTerm.id),
      });
      // don't close, allow multiple additions and update tasks
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleRemoveTask = async (task: Task) => {
    try {
      await removeTask({
        id: String(shortTerm.id),
        taskId: String(task.id),
      });
    } catch (error) {
      console.error("Error removing task:", error);
    }
  };

  return (
    <div className="flex justify-center items-center fixed inset-0 bg-black bg-opacity-50">
      <div className="flex flex-col bg-white p-6 rounded shadow-lg w-1/2 h-96">
        <div className="flex items-center justify-between">
          {cycleData && (
            <Dropdown
              options={getAvailableCycleOptions(cycleData)}
              selectedItemId={selectedCycle && String(selectedCycle.id)}
              onSelect={handleCycleSelect}
            />
          )}
          <button
            onClick={toggleOverlay}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Close
          </button>
        </div>
        <div className="flex flex-1 mt-4 overflow-hidden">
          <div className="w-1/2 pr-2 overflow-y-auto">
            <h3 className="font-semibold mb-2">Available Tasks</h3>
            <ul className="space-y-2">
              {contentData
                ?.filter(
                  (content: CycleContentItem) =>
                    !tasks?.some((task: Task) => task.content_id === content.id)
                )
                .map((content: CycleContentItem) => (
                  <li key={content.id}>
                    <button
                      onClick={() => handleContentSelect(content)}
                      className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {content.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
          <div className="w-px bg-gray-300 mx-4"></div>
          <div className="w-1/2 pl-2 overflow-y-auto">
            <h3 className="font-semibold mb-2">Existing Tasks</h3>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <TaskListItemForOverlay
                  key={task.id}
                  task={task}
                  onRemove={() => handleRemoveTask(task)}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this new component to display task items in the overlay with content names
const TaskListItemForOverlay = ({
  task,
  onRemove,
}: {
  task: Task;
  onRemove: () => void;
}) => {
  const { data: content, isLoading } = useFetchContentFromCycleByIdQuery({
    id: task.content_id,
  });

  return (
    <li>
      <button
        onClick={onRemove}
        className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded"
      >
        {isLoading ? "Loading..." : content?.[0]?.name || "Unknown content"}
      </button>
    </li>
  );
};
