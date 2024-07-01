import { useState } from "react";
import { CycleItem, User } from "../types";
import { CiCircleCheck } from "react-icons/ci";
import {
  useAddCategoryMutation,
  useAddCategoryToCycleMutation,
} from "../store";

interface FormControlProps {
  setExpandForm: (expandForm: boolean) => void;
  user: User;
  cycle: CycleItem | null;
}

const CategoryForm: React.FC<FormControlProps> = ({
  setExpandForm,
  user,
  cycle,
}) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addCategory, addCategoryResults] = useAddCategoryMutation();
  const [addCategoryToCycle, addCategoryToCycleResults] =
    useAddCategoryToCycleMutation();

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await addCategory({
      userId: user.id,
      name: newCategoryName,
    });
    // TODO: add error handling
    if ("data" in result && cycle != null) {
      addCategoryToCycle({ cycleId: cycle.id, categoryId: result.data.id });
    }
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

export default CategoryForm;
