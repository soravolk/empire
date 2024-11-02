import { useState } from "react";
import Dropdown from "../components/Dropdown";
import { CycleItem } from "../types";
import { useCycleListContext } from "../context/cycle";
import { getAvailableCycleOptions } from "../utils/utils";
import { Items } from "./LongTerm";
import { BsPencilSquare } from "react-icons/bs";

const CreateShortTerm = () => {
  return (
    <button>
      <BsPencilSquare />
    </button>
  );
};

export default function ShortTerm() {
  const [cycle, setCycle] = useState<CycleItem | null>(null);
  const { cycleList } = useCycleListContext();

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
          <CreateShortTerm />
        </div>
      </div>
      <div className="flex px-5 py-2">
        {cycle && <Items cycle={cycle} shortTerm />}
      </div>
    </div>
  );
}
