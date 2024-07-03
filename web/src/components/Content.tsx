import { CycleSubcategoryItem, CycleContentItem, CycleItem } from "../types";
import { useState } from "react";
import CreationForm from "./CreationForm";
import {
  useAddContentMutation,
  useAddContentToCycleMutation,
  useDeleteContentFromCycleMutation,
} from "../store";
import { MdDelete } from "react-icons/md";

interface ContentProps {
  subcategory: CycleSubcategoryItem | null;
  contents: CycleContentItem[];
  cycle: CycleItem | null; // TODO: cycle shouldn't be null
}

interface FormControlProps {
  setExpandForm: (expandForm: boolean) => void;
  subcategory: CycleSubcategoryItem;
  cycle: CycleItem;
}

const ContentForm: React.FC<FormControlProps> = ({
  setExpandForm,
  subcategory,
  cycle,
}) => {
  const [addContent, addContentResults] = useAddContentMutation();
  const [addContentToCycle, addContentToResults] =
    useAddContentToCycleMutation();

  const handleAddSubcategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await addContent({
      subcategoryId: String(subcategory.subcategory_id),
      name: (e.currentTarget.elements.namedItem("name") as HTMLInputElement)
        .value,
    });
    // TODO: add error handling
    if ("data" in result) {
      addContentToCycle({ cycleId: cycle.id, contentId: result.data.id });
    }
    setExpandForm(false);
  };

  return <CreationForm handleAddFunc={handleAddSubcategory} />;
};

const Content: React.FC<ContentProps> = ({ subcategory, contents, cycle }) => {
  const displayItems = contents.filter(
    (item) => item.subcategory_id === subcategory?.subcategory_id
  );
  const [expandForm, setExpandForm] = useState<boolean>(false);
  const [deleteContentFromCycle, deleteContentFromCycleResults] =
    useDeleteContentFromCycleMutation();
  return (
    <div>
      <div className="flex flex-col items-center space-y-4 shadow mx-5 p-4">
        <h3 className="font-bold mb-2">Cycle 1</h3>
        <ul className="list-inside list-disc space-y-3">
          {displayItems.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <li>{item.name}</li>
              <button>
                <MdDelete onClick={() => deleteContentFromCycle(item.id)} />
              </button>
            </div>
          ))}
        </ul>
        <button
          className="items-center justify-center bg-blue-500 text-white rounded-full h-12 w-12"
          onClick={() => setExpandForm(!expandForm)}
        >
          +
        </button>
        {/* TODO: tidy up subcategory and cycle check logic */}
        {expandForm && subcategory && cycle && (
          <ContentForm
            setExpandForm={setExpandForm}
            subcategory={subcategory}
            cycle={cycle}
          />
        )}
      </div>
    </div>
  );
};

export default Content;
