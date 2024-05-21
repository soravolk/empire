import { useState, useEffect } from "react";
import { CycleItem } from "../types";
import { useAddCycleMutation } from "../store";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface CycleProps {
  cycles: CycleItem[];
  setCycle: (cycle: CycleItem | null) => void;
}

type DateValue = Date | null;

type CycleRange = DateValue | [DateValue, DateValue];

const Cycle: React.FC<CycleProps> = ({ cycles, setCycle }) => {
  const [addCycle, addCycleResults] = useAddCycleMutation();
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
        <button
          className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12"
          onClick={() => handleAddCycle()}
        >
          +
        </button>
        {expandCalendar && (
          <Calendar
            selectRange
            value={date}
            onChange={handleSelectCycleRange}
          />
        )}
      </div>
    </div>
  );
};

export default Cycle;
