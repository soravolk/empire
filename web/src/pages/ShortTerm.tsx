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
        {shortTerm && "short term id: " + shortTerm.id}
      </div>
    </div>
  );
}
