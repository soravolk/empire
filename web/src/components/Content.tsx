import { CycleSubcategoryItem, CycleContentItem } from "../types";
import { useState, useContext } from "react";
import CreationForm from "./CreationForm";
import {
  useAddContentMutation,
  useAddContentToCycleMutation,
  useDeleteContentFromCycleMutation,
} from "../store";
import { MdDelete } from "react-icons/md";
import ItemCreationButton from "./ItemCreationButton";
import { CycleItemContext } from "../context/cycle";

interface ContentProps {
  subcategory: CycleSubcategoryItem;
  contents: CycleContentItem[];
  handleClickContent: (content: CycleContentItem) => void;
}

interface FormControlProps {
  setExpandForm: (expandForm: boolean) => void;
  subcategory: CycleSubcategoryItem;
}

const ContentForm: React.FC<FormControlProps> = ({
  setExpandForm,
  subcategory,
}) => {
  const [addContent, addContentResults] = useAddContentMutation();
  const [addContentToCycle, addContentToResults] =
    useAddContentToCycleMutation();
  const cycle = useContext(CycleItemContext);

  const handleAddSubcategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await addContent({
      subcategoryId: String(subcategory.subcategory_id),
      name: (e.currentTarget.elements.namedItem("name") as HTMLInputElement)
        .value,
    });
    // TODO: add error handling
    if (cycle && "data" in result) {
      addContentToCycle({ cycleId: cycle.id, contentId: result.data.id });
    }
    setExpandForm(false);
  };

  return <CreationForm handleAddFunc={handleAddSubcategory} />;
};

const Content: React.FC<ContentProps> = ({
  subcategory,
  contents,
  handleClickContent,
}) => {
  const displayItems = contents.filter(
    (item) => item.subcategory_id === subcategory?.subcategory_id
  );
  const [expandForm, setExpandForm] = useState<boolean>(false);
  const [deleteContentFromCycle, deleteContentFromCycleResults] =
    useDeleteContentFromCycleMutation();
  const handleAddContent = () => {
    setExpandForm(!expandForm);
  };
  return (
    <div className="flex flex-col items-center space-y-4 shadow mx-5 p-4">
      <h3 className="font-bold mb-2">Cycle 1</h3>
      <ul className="list-inside list-disc space-y-3">
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <li
              onClick={() => handleClickContent(item)}
              className="cursor-pointer"
            >
              {item.name}
            </li>
            <button>
              <MdDelete onClick={() => deleteContentFromCycle(item.id)} />
            </button>
          </div>
        ))}
      </ul>
      <ItemCreationButton handleClick={handleAddContent} />
      {/* TODO: tidy up subcategory and cycle check logic */}
      {expandForm && subcategory && (
        <ContentForm setExpandForm={setExpandForm} subcategory={subcategory} />
      )}
    </div>
  );
};

export default Content;
