import { useState } from "react";
import { GoChevronDown } from "react-icons/go";

interface DropdownProps {
  options: string[];
}

const Dropdown: React.FC<DropdownProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const toggling = () => setIsOpen(!isOpen);
  const onOptionClicked = (value: string) => () => {
    setSelectedOption(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggling}
        className="flex items-center justify-between px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
      >
        {selectedOption || "Choose an Option"}
        <GoChevronDown className="ml-2" /> {/* Icon added next to the text */}
      </button>
      {isOpen && (
        <ul className="absolute bg-white border mt-1 rounded shadow">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={onOptionClicked(option)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
