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
import { getAvailableShortTermOptions } from "../utils/utils";
import { BsPencilSquare } from "react-icons/bs";
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
} from "../store";
import { useLongTermContext } from "../context/longTerm";

interface CreateShortTermProps {
  user: User;
}

interface DetailCreationOverlayProps {
  shortTerm: ShortTermItem;
  selectedLongTerm: LongTermItem;
  toggleOverlay: () => void;
}

interface DetailItemInfoProps {
  detailItem: DetailItem;
}
interface DetailViewProps {
  toggleOverlay: () => void;
  detailItems: DetailItem[];
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

export default function ShortTerm() {
  const { selectedLongTerm } = useLongTermContext();
  const [shortTerm, setShortTerm] = useState<ShortTermItem | null>(null);

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
        <div>
          <CreateShortTerm user={userData} />
        </div>
      </div>
      <div className="flex px-5 py-2">
        {shortTerm && details && (
          <DetailView toggleOverlay={toggleOverlay} detailItems={details} />
        )}
      </div>
      {isOverlayVisible && shortTerm && selectedLongTerm && (
        <DetailCreationOverlay
          shortTerm={shortTerm}
          selectedLongTerm={selectedLongTerm}
          toggleOverlay={toggleOverlay}
        />
      )}
    </div>
  );
}

const DetailView = ({ toggleOverlay, detailItems }: DetailViewProps) => {
  const [selectedDetailItem, setSelectedDetailItem] =
    useState<DetailItem | null>(null);

  return (
    <div className="flex w-full h-full">
      <div className="w-1/2 border-r p-4">
        <h2 className="font-bold mb-4">All Details</h2>
        <div className="mb-4">
          <ul>
            {detailItems.map((item: DetailItem, idx: number) => (
              <li
                key={item.id}
                className="cursor-pointer p-2 rounded"
                onClick={() => setSelectedDetailItem(item)}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <button
            onClick={toggleOverlay}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Details
          </button>
        </div>
      </div>
      <div className="w-1/2 p-4">
        {selectedDetailItem ? (
          <DetailItemInfo detailItem={selectedDetailItem} />
        ) : (
          <div className="text-gray-500">
            Select a detail to view its information.
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItemInfo = ({ detailItem }: DetailItemInfoProps) => {
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
  const [timeSpent, setTimeSpent] = useState(detailItem.time_spent);

  useEffect(() => {
    setTimeSpent(detailItem.time_spent);
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
    console.log("finish");
  };

  const handleUnfinish = () => {
    console.log("unfinish");
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
      <div className="mt-4">
        <label className="flex items-center space-x-2">
          {detailItem.finished_date ? (
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
        </label>
      </div>
    </div>
  );
};

const DetailCreationOverlay = ({
  shortTerm,
  selectedLongTerm,
  toggleOverlay,
}: DetailCreationOverlayProps) => {
  const [selectedCycle, setSelectedCycle] = useState<CycleItem | null>(null);
  const [selectedContent, setSelectedContent] =
    useState<CycleContentItem | null>(null);
  const [isDetailFormVisible, setDetailFormVisible] = useState(false);
  const [detailName, setDetailName] = useState("");

  const { data: cycleData } = useFetchCyclesOfLongTermQuery(selectedLongTerm);
  const { data: contentData } = useFetchContentsFromCycleQuery(selectedCycle);
  const [addDetail] = useCreateDetailMutation();

  const handleCycleSelect = (cycle: CycleItem) => {
    setSelectedCycle(cycle);
    setDetailFormVisible(false);
    setSelectedContent(null);
  };

  const handleContentSelect = (content: CycleContentItem) => {
    setSelectedContent(content);
    setDetailFormVisible(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContent || !shortTerm || !detailName) return;

    try {
      await addDetail({
        contentId: String(selectedContent.id),
        shortTermId: String(shortTerm.id),
        name: detailName,
      });
      setDetailFormVisible(false);
      setDetailName("");
    } catch (error) {
      console.error("Error creating detail:", error);
    }
  };

  return (
    <div className="flex justify-center items-center fixed inset-0 bg-black bg-opacity-50">
      <div className="flex bg-white p-6 rounded shadow-lg w-5/6 h-96">
        <div className="flex-1">
          {cycleData && (
            <Dropdown
              options={cycleData.map((cycle: CycleItem) => ({
                data: cycle,
                displayText: `Cycle ${cycle.id}`,
              }))}
              onSelect={handleCycleSelect}
            />
          )}
          {contentData &&
            contentData.map((content: CycleContentItem) => {
              return (
                <li key={content.id} className="list-none mt-2">
                  <button
                    onClick={() => handleContentSelect(content)}
                    className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    {content.name}
                  </button>
                </li>
              );
            })}
        </div>
        <div className="w-px bg-gray-300 mx-4"></div>
        <div className="flex-1">
          {isDetailFormVisible && selectedContent ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Create Details for {selectedContent.name}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Detail Name
                  </label>
                  <input
                    type="text"
                    value={detailName}
                    onChange={(e) => setDetailName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDetailFormVisible(false);
                      setDetailName("");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <span className="block mb-4">
              Select a content item to create details
            </span>
          )}
          <button
            onClick={toggleOverlay}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
