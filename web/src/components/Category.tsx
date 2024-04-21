interface CategoryProps {
  categories: {
    id: number;
    cycle_id: number;
    category_id: number;
    name: string;
  }[];
  setCategory: (category: number | null) => void;
}

const Category: React.FC<CategoryProps> = ({ categories, setCategory }) => {
  const handleClick = (id: number) => {
    setCategory(id);
  };

  return (
    <div className="w-1.5/5">
      <div className="flex flex-col items-center space-y-4 mx-5 p-4">
        {categories.map((item) => (
          <button
            className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded"
            onClick={() => handleClick(item.category_id)}
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
