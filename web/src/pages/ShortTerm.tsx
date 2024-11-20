import { useState } from "react";
import Dropdown from "../components/Dropdown";
import { CycleItem, User } from "../types";
import { useCycleListContext } from "../context/cycle";
import { getAvailableCycleOptions } from "../utils/utils";
import { Items } from "./LongTerm";
import { BsPencilSquare } from "react-icons/bs";
import { useCreateShortTermMutation, useFetchCurrentUserQuery } from "../store";

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
  const [cycle, setCycle] = useState<CycleItem | null>(null);
  const { cycleList } = useCycleListContext();
  const { data: userData } = useFetchCurrentUserQuery(null);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          {cycleList && (
            <Dropdown
              options={getAvailableCycleOptions(cycleList)}
              onSelect={setCycle}
            />
          )}
        </div>
        <div>
          <CreateShortTerm user={userData} />
        </div>
      </div>
      <div className="flex px-5 py-2">
        {cycle && <Items cycle={cycle} shortTerm />}
      </div>
    </div>
  );
}
