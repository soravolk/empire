import { useState } from "react";
import { CycleCategoryItem, CycleItem, User } from "../types";
import { useDeleteCategoryFromCycleMutation } from "../store";
import { MdDelete } from "react-icons/md";
import CategoryForm from "./CategoryForm";

interface CategoryProps {
  categories: CycleCategoryItem[];
  setCategory: (category: CycleCategoryItem | null) => void;
  user: User;
  cycle: CycleItem | null;
}

const Category: React.FC<CategoryProps> = ({
  categories,
  setCategory,
  user,
  cycle,
}) => {
  const [expandForm, setExpandForm] = useState<boolean>(false);
  const [deleteCategoryFromCycle, deleteCategoryFromCycleResults] =
    useDeleteCategoryFromCycleMutation();

  const handleClick = (category: CycleCategoryItem) => {
    setCategory(category);
  };

  return (
    <div className="w-1.5/5">
      <div className="flex flex-col items-center space-y-4 mx-5 p-4">
        {categories.map((item: CycleCategoryItem, id: number) => (
          // TODO: make it a reusable component for cycle, category, and subcategory
          <div key={id} className="flex items-center space-x-2">
            <button
              className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded"
              onClick={() => handleClick(item)}
            >
              {item.name}
            </button>
            <button>
              <MdDelete onClick={() => deleteCategoryFromCycle(item.id)} />
            </button>
          </div>
        ))}
        <button
          className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12"
          onClick={() => setExpandForm(!expandForm)}
        >
          +
        </button>
        {expandForm && (
          <CategoryForm
            setExpandForm={setExpandForm}
            user={user}
            cycle={cycle}
          />
        )}
      </div>
    </div>
  );
};

export default Category;
