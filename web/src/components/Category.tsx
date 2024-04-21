import { CategoryItem } from "../types";

interface CategoryProps {
  categories: CategoryItem[];
  setCategory: (category: CategoryItem | null) => void;
}

const Category: React.FC<CategoryProps> = ({ categories, setCategory }) => {
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
        <button className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12">
          +
        </button>
      </div>
    </div>
  );
};

export default Category;
