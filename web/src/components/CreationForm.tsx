import { CiCircleCheck } from "react-icons/ci";

interface FormControlProps {
  handleAddFunc: (e: React.FormEvent<HTMLFormElement>) => void;
}

const CreationForm: React.FC<FormControlProps> = ({ handleAddFunc }) => {
  return (
    <form
      className="flex flex-col items-center border p-2 space-y-2"
      onSubmit={handleAddFunc}
    >
      <label>Name:</label>
      <input className="ml-2 border" type="text" name="name" />
      <button type="submit">
        <CiCircleCheck />
      </button>
    </form>
  );
};

export default CreationForm;
