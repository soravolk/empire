import { CycleCategoryItem, SubcategoryItem } from "../types";
import { MdDelete } from "react-icons/md";

type ItemType = CycleCategoryItem | SubcategoryItem;
interface TodoItemProps {
  item: ItemType;
  id: number;
  handleClick: (item: any) => void; // TODO: amend input type
  handleDelete: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  item,
  handleClick,
  handleDelete,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        className="items-center justify-center bg-gray-300 w-20 h-15 p-2 rounded"
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
