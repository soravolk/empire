import { CycleCategoryItem, CycleSubcategoryItem } from "../types";
import { MdDelete } from "react-icons/md";

type ItemType = CycleCategoryItem | CycleSubcategoryItem;
interface TodoItemProps {
  item: ItemType;
  selectedItem: ItemType | null;
  handleClick: (item: any) => void; // TODO: amend input type
  handleDelete: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  item,
  selectedItem,
  handleClick,
  handleDelete,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        className={`items-center justify-center bg-gray-200 w-20 h-15 p-2 rounded ${
          item.id === selectedItem?.id && "bg-gray-300"
        }`}
        onClick={() => handleClick(item)}
      >
        {item.name}
      </button>
      <button>
        <MdDelete onClick={() => handleDelete(item.id)} />
      </button>
    </div>
  );
};

export default TodoItem;
