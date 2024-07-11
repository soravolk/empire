import { useState } from "react";
import {
  CycleCategoryItem,
  CycleSubcategoryItem,
  CycleItem,
  User,
} from "../types";
import CreationForm from "./CreationForm";
import {
  useAddSubcategoryMutation,
  useAddSubcategoryToCycleMutation,
  useDeleteSubcategoryFromCycleMutation,
} from "../store";
import TodoItem from "./TodoItem";
import ItemCreationButton from "./ItemCreationButton";

interface SubcategoryProps {
  category: CycleCategoryItem;
  subcategories: CycleSubcategoryItem[];
  setSubcategory: (subcategory: CycleSubcategoryItem | null) => void;
  user: User;
  cycle: CycleItem;
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
      {expandForm && category && cycle && (
        <SubcategoryForm
          setExpandForm={setExpandForm}
          category={category}
          cycle={cycle}
        />
      )}
    </div>
  );
};

export default SubCategory;
