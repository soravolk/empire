import { useState } from "react";
import { CycleCategoryItem, CycleItem, User } from "../types";
import {
  useDeleteCategoryFromCycleMutation,
  useAddCategoryMutation,
  useAddCategoryToCycleMutation,
} from "../store";
import CreationForm from "./CreationForm";
import TodoItem from "./TodoItem";
import ItemCreationButton from "./ItemCreationButton";

interface CategoryProps {
  categories: CycleCategoryItem[];
  setCategory: (category: CycleCategoryItem | null) => void;
  user: User;
  cycle: CycleItem;
}

interface FormControlProps {
  setExpandForm: (expandForm: boolean) => void;
  user: User;
  cycle: CycleItem;
}

const CategoryForm: React.FC<FormControlProps> = ({
  setExpandForm,
  user,
  cycle,
}) => {
  const [addCategory, addCategoryResults] = useAddCategoryMutation();
  const [addCategoryToCycle, addCategoryToCycleResults] =
    useAddCategoryToCycleMutation();

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await addCategory({
      userId: user.id,
      name: (e.currentTarget.elements.namedItem("name") as HTMLInputElement)
        .value,
    });
    // // TODO: add error handling
    if ("data" in result) {
      addCategoryToCycle({ cycleId: cycle.id, categoryId: result.data.id });
    }
    setExpandForm(false);
  };

  return <CreationForm handleAddFunc={handleAddCategory} />;
};

const Category: React.FC<CategoryProps> = ({
  categories,
  setCategory,
  user,
  cycle,
}) => {
  const [expandForm, setExpandForm] = useState<boolean>(false);
  const [deleteCategoryFromCycle, deleteCategoryFromCycleResults] =
    useDeleteCategoryFromCycleMutation();
  const handleAddCategory = () => {
    setExpandForm(!expandForm);
  };
  return (
    <div className="flex flex-col items-center space-y-4 mx-5 p-4">
      {categories.map((item: CycleCategoryItem, id: number) => (
        <div key={id}>
          <TodoItem
            item={item}
            handleClick={setCategory}
            handleDelete={deleteCategoryFromCycle}
          />
        </div>
      ))}
      <ItemCreationButton handleClick={handleAddCategory} />
      {/* TODO: tidy up cycle check logic */}
      {expandForm && cycle && (
        <CategoryForm setExpandForm={setExpandForm} user={user} cycle={cycle} />
      )}
    </div>
  );
};

export default Category;
