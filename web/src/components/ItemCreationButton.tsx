import { MdAssignmentAdd } from "react-icons/md";

interface ItemCreationButtonProps {
  handleClick: () => void;
}

const ItemCreationButton: React.FC<ItemCreationButtonProps> = ({
  handleClick,
}) => (
  <button>
    <MdAssignmentAdd size={40} color="#6495ED" onClick={() => handleClick()} />
  </button>
);

export default ItemCreationButton;
