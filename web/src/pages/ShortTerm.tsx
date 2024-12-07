import { useState } from "react";
import Dropdown from "../components/Dropdown";
import { ShortTermItem, User } from "../types";
import { getAvailableShortTermOptions } from "../utils/utils";
import { BsPencilSquare } from "react-icons/bs";
import {
  useCreateShortTermMutation,
  useFetchCurrentUserQuery,
  useFetchShortTermsQuery,
} from "../store";

interface CreateShortTermProps {
  user: User;
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
  const [shortTerm, setShortTerm] = useState<ShortTermItem | null>(null);
  const { data: userData } = useFetchCurrentUserQuery(null);
  const { data: shortTermData } = useFetchShortTermsQuery(null);

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
        <div>
          <CreateShortTerm user={userData} />
        </div>
      </div>
      <div className="flex px-5 py-2">
        {shortTerm && (
          <div>
            <span className="text-gray-700">
              {"short term id: " + shortTerm.id}
            </span>
            <button
              onClick={toggleOverlay}
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Details
            </button>
          </div>
        )}
      </div>
      {isOverlayVisible && (
        <div className="flex justify-center items-center fixed inset-0 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-5/6 h-96">
            <span className="block mb-4">show contents of each cycle</span>
            <button
              onClick={toggleOverlay}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
