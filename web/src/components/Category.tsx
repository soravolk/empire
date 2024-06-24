import { useState } from "react";
import { CategoryItem, User } from "../types";
import { CiCircleCheck } from "react-icons/ci";
import { useAddCategoryMutation } from "../store";

interface CategoryProps {
  categories: CategoryItem[];
  setCategory: (category: CategoryItem | null) => void;
  user: User;
}

interface FormControlProps {
  setExpandForm: (expandForm: boolean) => void;
  user: User;
}

const CategoryForm: React.FC<FormControlProps> = ({ setExpandForm, user }) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addCategory, addCategoryResults] = useAddCategoryMutation();

  const handleAddCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addCategory({ userId: user.id, name: newCategoryName });
    setExpandForm(false);
  };
  return (
    <form
      className="flex flex-col items-center border p-2 space-y-2"
      onSubmit={handleAddCategory}
    >
      <label>
        Name:
        <input
          className="ml-2 border"
          type="text"
          name="name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
      </label>
      <button type="submit">
        <CiCircleCheck />
      </button>
    </form>
  );
};

const Category: React.FC<CategoryProps> = ({
  categories,
  setCategory,
  user,
}) => {
  const [expandForm, setExpandForm] = useState<boolean>(false);

  const handleClick = (category: CategoryItem) => {
    setCategory(category);
  };

  return (
    <div className="w-1.5/5">
      <div className="flex flex-col items-center space-y-4 mx-5 p-4">
        {categories.map((item) => (
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
          <CategoryForm setExpandForm={setExpandForm} user={user} />
        )}
      </div>
    </div>
  );
};

export default Category;
