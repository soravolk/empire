import { useState, useEffect } from "react";
import { CycleItem } from "../types";
import {
  useAddCycleMutation,
  useDeleteCycleMutation,
  useAddCategoryToCycleMutation,
  useAddSubcategoryToCycleMutation,
  useAddContentToCycleMutation,
  store,
} from "../store";
import { cyclesApi } from "../store/apis/cyclesApi";
import Calendar from "react-calendar";
import { MdDelete } from "react-icons/md";
import { MdContentCopy } from "react-icons/md";
import "react-calendar/dist/Calendar.css";
import ItemCreationButton from "./ItemCreationButton";
import { useLongTermContext } from "../context/longTerm";

interface CycleProps {
  cycles: CycleItem[];
  selectedCycle: CycleItem | null;
  setSelectedCycle: (cycle: CycleItem | null) => void;
}

type DateValue = Date | null;

type CycleRange = DateValue | [DateValue, DateValue];

const Cycle: React.FC<CycleProps> = ({
  cycles,
  selectedCycle,
  setSelectedCycle,
}) => {
  const { selectedLongTerm: longTerm } = useLongTermContext();

  const [addCycle, addCycleResults] = useAddCycleMutation();
  const [deleteCycle, deleteCycleResults] = useDeleteCycleMutation();
  const [addCategoryToCycle] = useAddCategoryToCycleMutation();
  const [addSubcategoryToCycle] = useAddSubcategoryToCycleMutation();
  const [addContentToCycle] = useAddContentToCycleMutation();
  const [expandCalendar, setExpandCalendar] = useState(false);

  const handleClick = (cycle: CycleItem) => {
    setSelectedCycle(cycle);
  };

  const handleAddCycle = () => {
    setExpandCalendar(!expandCalendar);
  };

  const handleSelectCycleRange = (date: CycleRange) => {
    setExpandCalendar(!expandCalendar);
    if (Array.isArray(date)) {
      addCycle({
        longTermId: longTerm?.id,
        startTime: date[0],
        endTime: date[1],
      });
    }
  };

  const handleCopyCycle = async (cycle: CycleItem) => {
    // Create a new cycle
    const newCycleResult = await addCycle({
      longTermId: longTerm?.id,
      startTime: cycle.start_time,
      endTime: cycle.end_time,
    });
    if (!("data" in newCycleResult) || !newCycleResult.data) {
      throw new Error("Failed to create new cycle");
    }
    const newCycle = newCycleResult.data;

    // Fetch all data from the original cycle using RTK Query
    const categoriesPromise = store.dispatch(
      cyclesApi.endpoints.fetchCategoriesFromCycle.initiate(cycle)
    );
    const subcategoriesPromise = store.dispatch(
      cyclesApi.endpoints.fetchSubcategoriesFromCycle.initiate(cycle)
    );
    const contentsPromise = store.dispatch(
      cyclesApi.endpoints.fetchContentsFromCycle.initiate(cycle)
    );
    const [categoriesResult, subcategoriesResult, contentsResult] =
      await Promise.all([
        categoriesPromise,
        subcategoriesPromise,
        contentsPromise,
      ]);
    const categories = categoriesResult.data;
    const subcategories = subcategoriesResult.data;
    const contents = contentsResult.data;
    if (
      !categoriesResult.data.length ||
      !subcategoriesResult.data.length ||
      !contentsResult.data.length
    ) {
      throw new Error("Failed to create new cycle");
    }

    // Recreate category/subcategory/contnet and their relationships
    for (const category of categories) {
      await addCategoryToCycle({
        cycleId: newCycle.id,
        categoryId: category.category_id,
      });

      const categorySubcategories = subcategories.filter(
        (sub: any) => sub.category_id === category.category_id
      );

      for (const subcategory of categorySubcategories) {
        await addSubcategoryToCycle({
          cycleId: newCycle.id,
          subcategoryId: subcategory.subcategory_id,
        });

        const subcategoryContents = contents.filter(
          (content: any) =>
            content.subcategory_id === subcategory.subcategory_id
        );

        for (const content of subcategoryContents) {
          await addContentToCycle({
            cycleId: newCycle.id,
            contentId: content.content_id,
          });
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {cycles &&
        cycles.map((item: CycleItem, id: number) => (
          <div key={id} className="flex items-center space-x-2">
            <button
              className={`items-center justify-center bg-gray-200 rounded-full w-20 h-20 ${
                item.id === selectedCycle?.id && "bg-gray-300"
              }`}
              onClick={() => handleClick(item)}
            >
              {`Cycle ${id + 1}`}
            </button>
            <button onClick={() => handleCopyCycle(item)}>
              <MdContentCopy />
            </button>
            <button>
              <MdDelete onClick={() => deleteCycle(item)} />
            </button>
          </div>
        ))}
      <ItemCreationButton handleClick={handleAddCycle} />
      {expandCalendar && (
        <Calendar selectRange onChange={handleSelectCycleRange} />
      )}
    </div>
  );
};

export default Cycle;
