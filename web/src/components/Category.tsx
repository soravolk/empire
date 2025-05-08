import { useState, useContext } from "react";
import { CycleCategoryItem, User } from "../types";
import {
  useDeleteCategoryFromCycleMutation,
  useAddCategoryMutation,
  useAddCategoryToCycleMutation,
} from "../store";
import CreationForm from "./CreationForm";
import TodoItem from "./TodoItem";
import ItemCreationButton from "./ItemCreationButton";
import { CycleItemContext } from "../context/cycle";

interface CategoryProps {
  categories: CycleCategoryItem[];
  handleClickCategory: (category: CycleCategoryItem) => void;
  user: User;
}

interface FormControlProps {
  setExpandForm: (expandForm: boolean) => void;
  user: User;
}

const CategoryForm: React.FC<FormControlProps> = ({ setExpandForm, user }) => {
  const [addCategory, addCategoryResults] = useAddCategoryMutation();
  const [addCategoryToCycle, addCategoryToCycleResults] =
    useAddCategoryToCycleMutation();
  const cycle = useContext(CycleItemContext);
  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await addCategory({
      userId: user.id,
      name: (e.currentTarget.elements.namedItem("name") as HTMLInputElement)
        .value,
    });
    // TODO: add error handling and remove cycle check
    if (cycle && "data" in result) {
      addCategoryToCycle({ cycleId: cycle.id, categoryId: result.data.id });
    }
    setExpandForm(false);
  };

  return <CreationForm handleAddFunc={handleAddCategory} />;
};

const Category: React.FC<CategoryProps> = ({
  categories,
  handleClickCategory,
  user,
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
            handleClick={handleClickCategory}
            handleDelete={deleteCategoryFromCycle}
          />
        </div>
      ))}
      <ItemCreationButton handleClick={handleAddCategory} />
      {/* TODO: tidy up cycle check logic */}
      {expandForm && <CategoryForm setExpandForm={setExpandForm} user={user} />}
    </div>
  );
};

export default Category;
