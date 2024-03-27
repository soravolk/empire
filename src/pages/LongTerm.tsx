import { useState } from "react";

const CYCLES = [
  {
    id: 0,
    long_term_id: 0,
  },
  {
    id: 1,
    long_term_id: 0,
  },
  {
    id: 2,
    long_term_id: 0,
  },
];

const CATEGORIES = [
  {
    id: 0,
    cycle_id: 0,
    category_id: 0,
    name: "Machine Learning",
  },
  {
    id: 0,
    cycle_id: 0,
    category_id: 1,
    name: "System Design",
  },
  {
    id: 0,
    cycle_id: 0,
    category_id: 2,
    name: "Fullstack",
  },
];

interface CategoryProps {
  cycle: number | null;
  categories: {
    id: number;
    cycle_id: number;
    category_id: number;
    name: string;
  }[];
}

interface CycleProps {
  cycles: { id: number; long_term_id: number }[];
  setCycle: (cycle: number | null) => void;
}

const Cycle: React.FC<CycleProps> = ({ cycles, setCycle }) => {
  const handleClick = (id: number) => {
    setCycle(id);
  };

  return (
    <div className="w-1/5 p-6">
      <div className="flex flex-col items-center space-y-2">
        {cycles.map((item, id) => (
          <button
            className="items-center justify-center bg-gray-300 rounded-full w-20 h-20"
            onClick={() => handleClick(item.id)}
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

const Category: React.FC<CategoryProps> = ({ cycle, categories }) => {
  const displayItems = categories.filter((item) => item.cycle_id === cycle);

  return (
    <div className="w-1.5/5">
      <div className="flex flex-col items-center space-y-4 mx-5 p-4">
        {displayItems.map((item) => (
          <button className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded">
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

const SubCategory = () => (
  <div className="w-1.5/5">
    <div className="flex flex-col items-center space-y-4 mx-5 p-4">
      <button className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded">
        Next.js
      </button>
      <button className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded">
        NestJS
      </button>
      <button className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12">
        +
      </button>
    </div>
  </div>
);

const Content = () => (
  <div>
    <div className="flex flex-col items-center space-y-4 shadow mx-5 p-4">
      <h3 className="font-bold mb-2">Cycle 1</h3>
      <ul className="list-inside list-disc space-y-3">
        <li>Data Fetching</li>
        <li>Rendering</li>
        <li>Caching</li>
      </ul>
      <button className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12">
        +
      </button>
    </div>
  </div>
);

export default function LongTerm() {
  const [cycle, setCycle] = useState<number | null>(null);

  return (
    <div className="flex">
      <Cycle cycles={CYCLES} setCycle={setCycle} />
      <Category cycle={cycle} categories={CATEGORIES} />
      <SubCategory />
      <Content />
    </div>
  );
}
