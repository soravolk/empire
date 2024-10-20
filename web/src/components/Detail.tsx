import React from "react";
import { CycleContentItem } from "../types";

type DetailProps = {
  content: CycleContentItem;
};

const Detail: React.FC<DetailProps> = ({ content }) => {
  return (
    <div className="p-4 bg-white shadow rounded-lg">
      Content: {content.name}
    </div>
  );
};

export default Detail;
