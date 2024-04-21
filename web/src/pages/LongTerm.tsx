import { useState } from "react";
import {
  useFetchLongTermsQuery,
  useFetchCyclesOfLongTermQuery,
  useFetchCategoriesFromCycleQuery,
  useFetchSubcategoriesFromCycleQuery,
} from "../store";
import Dropdown from "../components/Dropdown";
import { getLongTermHistoryOptions } from "../utils/utils";
import { LongTermItem, CycleItem } from "../types";

const CONTENTS = [
  {
    id: 0,
    cycle_id: 0,
    content_id: 0,
    subcategory_id: 0,
    name: "Data Fetching",
  },
  {
    id: 1,
    cycle_id: 0,
    content_id: 1,
    subcategory_id: 0,
    name: "Rendering",
  },
  {
    id: 2,
    cycle_id: 0,
    content_id: 2,
    subcategory_id: 0,
    name: "Caching",
  },
];

interface ContentProps {
  cycle: CycleItem | null;
  subcategory: number | null;
  contents: {
    id: number;
    cycle_id: number;
    subcategory_id: number;
    content_id: number;
    name: string;
  }[];
}

interface SubcategoryProps {
  category: number | null;
  subcategories: {
    id: number;
    cycle_id: number;
    category_id: number;
    subcategory_id: number;
    name: string;
  }[];
  setSubcategory: (subcategory: number | null) => void;
}

interface CategoryProps {
  categories: {
    id: number;
    cycle_id: number;
    category_id: number;
    name: string;
  }[];
  setCategory: (category: number | null) => void;
}

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

const Category: React.FC<CategoryProps> = ({ categories, setCategory }) => {
  const handleClick = (id: number) => {
    setCategory(id);
  };

  return (
    <div className="w-1.5/5">
      <div className="flex flex-col items-center space-y-4 mx-5 p-4">
        {categories.map((item) => (
          <button
            className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded"
            onClick={() => handleClick(item.category_id)}
          >
            {item.name}
          </button>
        ))}
        <button className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12">
          +
        </button>
      </div>
    </div>
  );
};

const SubCategory: React.FC<SubcategoryProps> = ({
  category,
  subcategories,
  setSubcategory,
}) => {
  const displayItems = subcategories.filter(
    (item) => item.category_id === category
  );
  const handleClick = (id: number) => {
    setSubcategory(id);
  };

  return (
    <div className="w-1.5/5">
      <div className="flex flex-col items-center space-y-4 mx-5 p-4">
        {displayItems.map((item) => (
          <button
            className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded"
            onClick={() => handleClick(item.subcategory_id)}
          >
            {item.name}
          </button>
        ))}
        <button className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12">
          +
        </button>
      </div>
    </div>
  );
};

const Content: React.FC<ContentProps> = ({ cycle, subcategory, contents }) => {
  const displayItems = contents.filter(
    (item) => item.cycle_id === cycle?.id && item.subcategory_id === subcategory
  );
  return (
    <div>
      <div className="flex flex-col items-center space-y-4 shadow mx-5 p-4">
        <h3 className="font-bold mb-2">Cycle 1</h3>
        <ul className="list-inside list-disc space-y-3">
          {displayItems.map((item) => (
            <li>{item.name}</li>
          ))}
        </ul>
        <button className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12">
          +
        </button>
      </div>
    </div>
  );
};

export default function LongTerm() {
  const [cycle, setCycle] = useState<CycleItem | null>(null);
  const [longTerm, setLongTerm] = useState<LongTermItem | null>(null);
  const [category, setCategory] = useState<number | null>(null);
  const [subcategory, setSubcategory] = useState<number | null>(null);
  const { data, error, isLoading } = useFetchLongTermsQuery(null);
  const {
    data: categoryData,
    error: categoryFetchError,
    isLoading: isCategoryLoading,
  } = useFetchCategoriesFromCycleQuery(cycle);
  const {
    data: subcategoryData,
    error: subcategoryFetchError,
    isLoading: isSubCategoryLoading,
  } = useFetchSubcategoriesFromCycleQuery(cycle);

  return (
    <div className="flex flex-col p-4">
      <div className="w-full mb-4">
        {data && (
          <Dropdown
            options={getLongTermHistoryOptions(data)}
            onSelect={setLongTerm}
          />
        )}
      </div>
      <div className="flex">
        {longTerm && <Cycle longTerm={longTerm} setCycle={setCycle} />}
        {categoryData && (
          <Category categories={categoryData} setCategory={setCategory} />
        )}
        {subcategoryData && (
          <SubCategory
            category={category}
            subcategories={subcategoryData}
            setSubcategory={setSubcategory}
          />
        )}
        <Content cycle={cycle} subcategory={subcategory} contents={CONTENTS} />
      </div>
    </div>
  );
}
