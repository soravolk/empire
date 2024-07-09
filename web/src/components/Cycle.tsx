import { useState, useEffect } from "react";
import { CycleItem } from "../types";
import { useAddCycleMutation, useDeleteCycleMutation } from "../store";
import Calendar from "react-calendar";
import { MdDelete } from "react-icons/md";
import "react-calendar/dist/Calendar.css";
import ItemCreationButton from "./ItemCreationButton";

interface CycleProps {
  cycles: CycleItem[];
  setCycle: (cycle: CycleItem | null) => void;
}

type DateValue = Date | null;

type CycleRange = DateValue | [DateValue, DateValue];

const Cycle: React.FC<CycleProps> = ({ cycles, setCycle }) => {
  const [addCycle, addCycleResults] = useAddCycleMutation();
  const [deleteCycle, deleteCycleResults] = useDeleteCycleMutation();
  const [date, setDate] = useState<CycleRange>(null);
  const [expandCalendar, setExpandCalendar] = useState(false);

  const handleClick = (cycle: CycleItem) => {
    setCycle(cycle);
  };

  const handleAddCycle = () => {
    setExpandCalendar(!expandCalendar);
  };

  const handleSelectCycleRange = (e: CycleRange) => {
    setDate(e);
    setExpandCalendar(!expandCalendar);
  };

  useEffect(() => {
    if (Array.isArray(date)) {
      addCycle({
        longTermId: cycles[0].long_term_id,
        startTime: date[0],
        endTime: date[1],
      });
    }
  }, [date]);

  return (
    <div className="flex flex-col items-center space-y-2">
      {cycles &&
        cycles.map((item: CycleItem, id: number) => (
          <div key={id} className="flex items-center space-x-2">
            <button
              className="items-center justify-center bg-gray-300 rounded-full w-20 h-20"
              onClick={() => handleClick(item)}
            >
              {`Cycle ${id + 1}`}
            </button>
            <button>
              <MdDelete onClick={() => deleteCycle(item)} />
            </button>
          </div>
        ))}
      <ItemCreationButton handleClick={handleAddCycle} />
      {expandCalendar && (
        <Calendar selectRange value={date} onChange={handleSelectCycleRange} />
      )}
    </div>
  );
};

export default Cycle;
