import { useFetchCyclesOfLongTermQuery } from "../store";
import { LongTermItem, CycleItem } from "../types";

interface CycleProps {
  longTerm: LongTermItem;
  setCycle: (cycle: CycleItem | null) => void;
}

const Cycle: React.FC<CycleProps> = ({ longTerm, setCycle }) => {
  const {
    data: cycles,
    error,
    isLoading,
  } = useFetchCyclesOfLongTermQuery(longTerm);

  const handleClick = (cycle: CycleItem) => {
    setCycle(cycle);
  };

  return (
    <div className="w-1/5 p-6">
      <div className="flex flex-col items-center space-y-2">
        {cycles &&
          cycles.map((item: CycleItem, id: number) => (
            <button
              className="items-center justify-center bg-gray-300 rounded-full w-20 h-20"
              onClick={() => handleClick(item)}
            >
              {`Cycle ${id + 1}`}
            </button>
          ))}
        <button className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12">
          +
        </button>
      </div>
    </div>
  );
};

export default Cycle;
