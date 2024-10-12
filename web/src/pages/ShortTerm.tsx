import { useState } from "react";
import Dropdown from "../components/Dropdown";
import { CycleItem } from "../types";
import { useCycleListContext } from "../context/cycle";
import { getAvailableCycleOptions } from "../utils/utils";

export default function ShortTerm() {
  const [cycle, setCycle] = useState<CycleItem | null>(null);
  const { cycleList } = useCycleListContext();

  return (
    <div className="flex flex-col">
      <div className="w-full mb-4">
        {cycleList && (
          <Dropdown
            options={getAvailableCycleOptions(cycleList)}
            onSelect={setCycle}
          />
        )}
      </div>
    </div>
  );
}
