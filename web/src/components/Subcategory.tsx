import { SubcategoryItem } from "../types";

interface SubcategoryProps {
  category: number | null;
  subcategories: SubcategoryItem[];
  setSubcategory: (subcategory: number | null) => void;
}

const SubCategory: React.FC<SubcategoryProps> = ({
  category,
  subcategories,
  setSubcategory,
}) => {
  const displayItems = subcategories.filter(
    (item) => item.category_id === category
  );
  const handleClick = (id: number) => {
    setSubcategory(id);
  };

  return (
    <div className="w-1.5/5">
      <div className="flex flex-col items-center space-y-4 mx-5 p-4">
        {displayItems.map((item) => (
          <button
            className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded"
            onClick={() => handleClick(item.subcategory_id)}
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

export default SubCategory;
