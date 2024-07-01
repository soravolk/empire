import { useState } from "react";
import { CycleCategoryItem, SubcategoryItem, CycleItem, User } from "../types";
import SubcategoryForm from "./CategoryForm";

interface SubcategoryProps {
  category: CycleCategoryItem | null;
  subcategories: SubcategoryItem[];
  setSubcategory: (subcategory: SubcategoryItem | null) => void;
  user: User;
  cycle: CycleItem | null;
}

const SubCategory: React.FC<SubcategoryProps> = ({
  category,
  subcategories,
  setSubcategory,
  user,
  cycle,
}) => {
  const [expandForm, setExpandForm] = useState<boolean>(false);
  const displayItems = subcategories.filter(
    (item) => item.category_id === category?.category_id
  );
  const handleClick = (subcategory: SubcategoryItem) => {
    setSubcategory(subcategory);
  };

  return (
    <div className="w-1.5/5">
      <div className="flex flex-col items-center space-y-4 mx-5 p-4">
        {displayItems.map((item) => (
          <button
            className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded"
            onClick={() => handleClick(item)}
          >
            {item.name}
          </button>
        ))}
        <button
          className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12"
          onClick={() => setExpandForm(!expandForm)}
        >
          +
        </button>
        {expandForm && (
          <SubcategoryForm
            setExpandForm={setExpandForm}
            user={user}
            cycle={cycle}
          />
        )}
      </div>
    </div>
  );
};

export default SubCategory;
