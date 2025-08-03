import { useState, useEffect } from "react";
import Dropdown from "../components/Dropdown";
import {
  CycleContentItem,
  CycleItem,
  LongTermItem,
  ShortTermItem,
  Detail as DetailItem,
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
  useFetchDetailsFromShortTermQuery,
  useCreateDetailMutation,
  useUpdateTimeSpentMutation,
  useUpdateFinishedDateMutation,
  useDeleteShortTermMutation,
  useDeleteShortTermDetailMutation,
} from "../store";
import { useLongTermContext } from "../context/longTerm";
import { useShortTermContext } from "../context/shortTerm";

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

interface DetailCreationOverlayProps {
  shortTerm: ShortTermItem;
  selectedLongTerm: LongTermItem;
  toggleOverlay: () => void;
  detailItems: DetailItem[];
}

interface DetailItemInfoProps {
  detailItem: DetailItem;
  shortTerm: ShortTermItem;
}
interface DetailViewProps {
  toggleOverlay: () => void;
  shortTerm: ShortTermItem;
  detailItems: DetailItem[];
}

interface DeleteDetailItemProps {
  detailItem: DetailItem;
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
  const [createDetail] = useCreateDetailMutation();
  const { data: details } = useFetchDetailsFromShortTermQuery({
    shortTermId: selectedShortTerm.id,
  });

  const handleCopy = async () => {
    if (!details) {
      throw new Error("Failed to create new short term");
    }

    const newShortTermResult = await createShortTerm({ userId: user.id });
    if (!("data" in newShortTermResult) || !newShortTermResult.data) {
      throw new Error("Failed to create new short term");
    }
    const newShortTerm = newShortTermResult.data;

    // Copy details for the new short term
    for (const detail of details) {
      await createDetail({
        contentId: String(detail.content_id),
        shortTermId: String(newShortTerm.id),
      });
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
  const { data: details } = useFetchDetailsFromShortTermQuery({
    shortTermId: shortTerm?.id,
  });

  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const toggleOverlay = () => {
    setOverlayVisible(!isOverlayVisible);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
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
      <div className="flex px-5 py-2">
        {shortTerm && details && (
          <DetailView
            toggleOverlay={toggleOverlay}
            shortTerm={shortTerm}
            detailItems={details}
          />
        )}
      </div>
      {isOverlayVisible && shortTerm && selectedLongTerm && (
        <DetailCreationOverlay
          shortTerm={shortTerm}
          selectedLongTerm={selectedLongTerm}
          toggleOverlay={toggleOverlay}
          detailItems={details}
        />
      )}
    </div>
  );
}

const DetailView = ({
  toggleOverlay,
  shortTerm,
  detailItems,
}: DetailViewProps) => {
  const [selectedDetailItem, setSelectedDetailItem] =
    useState<DetailItem | null>(null);

  return (
    <div className="flex w-full h-full">
      <div className="w-1/2 border-r p-4">
        <h2 className="font-bold mb-4">All Tasks</h2>
        <div className="mb-4">
          <ul>
            {detailItems.map((item: DetailItem, idx: number) => (
              <DetailListItem
                key={item.id}
                item={item}
                isSelected={selectedDetailItem?.id === item.id}
                onSelect={() => setSelectedDetailItem(item)}
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
        {selectedDetailItem ? (
          <DetailItemInfo
            shortTerm={shortTerm}
            detailItem={selectedDetailItem}
          />
        ) : (
          <div className="text-gray-500">
            Select a detail to view its information.
          </div>
        )}
      </div>
    </div>
  );
};

// Add this new component to fetch and display content name
const DetailListItem = ({
  item,
  isSelected,
  onSelect,
}: {
  item: DetailItem;
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

const DetailItemInfo = ({ shortTerm, detailItem }: DetailItemInfoProps) => {
  // TODO: need to refactor: 1. too many rerender, 2. flaky logic to display information and error handling
  const { data: content, isLoading: isContentLoading } =
    useFetchContentFromCycleByIdQuery({
      id: detailItem.content_id,
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

  const [updateTimeSpent] = useUpdateTimeSpentMutation();
  const [updateFinishedDate] = useUpdateFinishedDateMutation();
  const [timeSpent, setTimeSpent] = useState(detailItem.time_spent);
  const [finished, setFinished] = useState<boolean>(false);

  useEffect(() => {
    setTimeSpent(detailItem.time_spent);
    setFinished(detailItem.finished_date != null);
  }, [detailItem]);

  const [isEditing, setIsEditing] = useState(false);

  const handleTimeSpentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeSpent = parseInt(e.target.value) || 0;
    setTimeSpent(newTimeSpent);
    setIsEditing(true);
  };

  const handleConfirmTimeSpent = () => {
    updateTimeSpent({ id: String(detailItem.id), timeSpent });
    setIsEditing(false);
  };

  const handleCancelTimeSpent = () => {
    setTimeSpent(detailItem.time_spent || 0);
    setIsEditing(false);
  };

  const handleFinish = () => {
    updateFinishedDate({
      id: String(detailItem.id),
      finishedDate: new Date().toISOString(),
    });
    setFinished(true);
  };

  const handleUnfinish = () => {
    updateFinishedDate({ id: String(detailItem.id), finishedDate: null });
    setFinished(false);
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {isEditing && (
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
      <div
        className="flex mt-4 justify-between
      "
      >
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
        <DeleteDetailItem shortTerm={shortTerm} detailItem={detailItem} />
      </div>
    </div>
  );
};

const DeleteDetailItem = ({ shortTerm, detailItem }: DeleteDetailItemProps) => {
  const [removeShortTerm] = useDeleteShortTermDetailMutation();

  const handleClick = () => {
    removeShortTerm({
      id: String(shortTerm.id),
      detailId: String(detailItem.id),
    });
  };

  return (
    <button onClick={handleClick}>
      <MdDelete />
    </button>
  );
};

const DetailCreationOverlay = ({
  shortTerm,
  selectedLongTerm,
  toggleOverlay,
  detailItems,
}: DetailCreationOverlayProps) => {
  const [selectedCycle, setSelectedCycle] = useState<CycleItem | null>(null);

  const { data: cycleData } = useFetchCyclesOfLongTermQuery(selectedLongTerm);
  const { data: contentData } = useFetchContentsFromCycleQuery(selectedCycle);
  const [addDetail] = useCreateDetailMutation();
  const [removeDetail] = useDeleteShortTermDetailMutation();

  const handleCycleSelect = (cycle: CycleItem) => {
    setSelectedCycle(cycle);
  };

  const handleContentSelect = async (content: CycleContentItem) => {
    try {
      await addDetail({
        contentId: String(content.id),
        shortTermId: String(shortTerm.id),
      });
      // don't close, allow multiple additions and update detailItems
    } catch (error) {
      console.error("Error creating detail:", error);
    }
  };

  const handleRemoveDetail = async (detail: DetailItem) => {
    try {
      await removeDetail({
        id: String(shortTerm.id),
        detailId: String(detail.id),
      });
    } catch (error) {
      console.error("Error removing detail:", error);
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
                    !detailItems?.some(
                      (detail: DetailItem) => detail.content_id === content.id
                    )
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
              {detailItems.map((detail) => (
                <DetailListItemForOverlay
                  key={detail.id}
                  detail={detail}
                  onRemove={() => handleRemoveDetail(detail)}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this new component to display detail items in the overlay with content names
const DetailListItemForOverlay = ({
  detail,
  onRemove,
}: {
  detail: DetailItem;
  onRemove: () => void;
}) => {
  const { data: content, isLoading } = useFetchContentFromCycleByIdQuery({
    id: detail.content_id,
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
