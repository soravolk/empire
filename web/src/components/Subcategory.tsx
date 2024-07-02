import { useState } from "react";
import { CycleCategoryItem, SubcategoryItem, CycleItem, User } from "../types";
import CreationForm from "./CreationForm";
import {
  useAddSubcategoryMutation,
  useAddSubcategoryToCycleMutation,
} from "../store";

interface SubcategoryProps {
  category: CycleCategoryItem | null;
  subcategories: SubcategoryItem[];
  setSubcategory: (subcategory: SubcategoryItem | null) => void;
  user: User;
  cycle: CycleItem | null;
}

interface FormControlProps {
  setExpandForm: (expandForm: boolean) => void;
  category: CycleCategoryItem;
  cycle: CycleItem;
}

const SubcategoryForm: React.FC<FormControlProps> = ({
  setExpandForm,
  category,
  cycle,
}) => {
  const [addSubcategory, addSubcategoryResults] = useAddSubcategoryMutation();
  const [addSubcategoryToCycle, addSubcategoryToCycleResults] =
    useAddSubcategoryToCycleMutation();
  const handleAddSubcategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await addSubcategory({
      categoryId: String(category.category_id),
      name: (e.currentTarget.elements.namedItem("name") as HTMLInputElement)
        .value,
    });
    // TODO: add error handling
    if ("data" in result) {
      addSubcategoryToCycle({
        cycleId: cycle.id,
        subcategoryId: result.data.id,
      });
    }
    setExpandForm(false);
  };

  return <CreationForm handleAddFunc={handleAddSubcategory} />;
};

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
        {/* TODO: tidy up category and cycle check logic */}
        {expandForm && category && cycle && (
          <SubcategoryForm
            setExpandForm={setExpandForm}
            category={category}
            cycle={cycle}
          />
        )}
      </div>
    </div>
  );
};

export default SubCategory;
