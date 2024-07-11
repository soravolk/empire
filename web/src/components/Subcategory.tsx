import { useState, useContext } from "react";
import { CycleCategoryItem, CycleSubcategoryItem, User } from "../types";
import CreationForm from "./CreationForm";
import {
  useAddSubcategoryMutation,
  useAddSubcategoryToCycleMutation,
  useDeleteSubcategoryFromCycleMutation,
} from "../store";
import TodoItem from "./TodoItem";
import ItemCreationButton from "./ItemCreationButton";
import CycleContext from "../context/cycle";

interface SubcategoryProps {
  category: CycleCategoryItem;
  subcategories: CycleSubcategoryItem[];
  setSubcategory: (subcategory: CycleSubcategoryItem | null) => void;
}

interface FormControlProps {
  setExpandForm: (expandForm: boolean) => void;
  category: CycleCategoryItem;
}

const SubcategoryForm: React.FC<FormControlProps> = ({
  setExpandForm,
  category,
}) => {
  const cycle = useContext(CycleContext);
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
    // TODO: add error handling and remove cycle check
    if (cycle && "data" in result) {
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
}) => {
  const displayItems = subcategories.filter(
    (item) => item.category_id === category?.category_id
  );
  const [expandForm, setExpandForm] = useState<boolean>(false);

  const [deleteSubcategoryFromCycle, deleteSubcategoryFromCycleResults] =
    useDeleteSubcategoryFromCycleMutation();
  const handleAddSubcategory = () => {
    setExpandForm(!expandForm);
  };

  return (
    <div className="flex flex-col items-center space-y-4 mx-5 p-4">
      {displayItems.map((item: CycleSubcategoryItem, id: number) => (
        <div key={id}>
          <TodoItem
            item={item}
            handleClick={setSubcategory}
            handleDelete={deleteSubcategoryFromCycle}
          />
        </div>
      ))}
      <ItemCreationButton handleClick={handleAddSubcategory} />
      {/* TODO: tidy up category and cycle check logic */}
      {expandForm && category && (
        <SubcategoryForm setExpandForm={setExpandForm} category={category} />
      )}
    </div>
  );
};

export default SubCategory;
