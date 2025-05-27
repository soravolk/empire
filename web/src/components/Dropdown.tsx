import { useEffect, useState } from "react";
import { GoChevronDown } from "react-icons/go";

interface Option {
  data: any;
  displayText: string;
}

interface DropdownProps {
  options: Option[];
  selectedItemId: string | null;
  onSelect: (selection: any) => void;
  buttonComponent?: (displayText: string) => JSX.Element;
}

const defaultDropdownButton = (displayText: string) => (
  <button className="flex items-center justify-between px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">
    {displayText}
    <GoChevronDown className="ml-2" /> {/* Icon added next to the text */}
  </button>
);

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedItemId,
  onSelect,
  buttonComponent = defaultDropdownButton,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [displayText, setDisplayText] = useState<string>("Choose an Option");
  const toggling = () => setIsOpen(!isOpen);
  const onOptionClicked = (option: Option) => () => {
    onSelect(option.data);
    setDisplayText(option.displayText);
    setIsOpen(false);
  };

  useEffect(() => {
    options.forEach((option) => {
      if (String(option.data.id) === selectedItemId) {
        setDisplayText(option.displayText);
      }
    });
  }, [selectedItemId, options]);

  return (
    <div className="relative">
      <div onClick={toggling}>{buttonComponent(displayText)}</div>
      {isOpen && (
        <ul className="absolute bg-white border mt-1 rounded shadow">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={onOptionClicked(option)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {option.displayText}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
