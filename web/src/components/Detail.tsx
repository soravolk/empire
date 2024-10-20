import React, { useState } from "react";
import { CycleContentItem } from "../types";
import ItemCreationButton from "./ItemCreationButton";
import CreationForm from "./CreationForm";

type DetailProps = {
  content: CycleContentItem;
};

type FormControlProps = {
  setExpandForm: (expand: boolean) => void;
};

const DetailForm: React.FC<FormControlProps> = ({ setExpandForm }) => {
  const handleAddDetail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setExpandForm(false);
  };

  return <CreationForm handleAddFunc={handleAddDetail} />;
};
const Detail: React.FC<DetailProps> = ({ content }) => {
  const [expandForm, setExpandForm] = useState<boolean>(false);

  const handleAddDetail = () => {
    setExpandForm(!expandForm);
  };

  return (
    <div className="flex flex-col p-4 bg-white shadow rounded-lg">
      Content: {content.name}
      <ItemCreationButton handleClick={handleAddDetail} />
      {expandForm && <DetailForm setExpandForm={setExpandForm} />}
    </div>
  );
};

export default Detail;
