import React, { createContext, useContext, useState } from "react";
import { LongTermItem } from "../types";

interface LongTermContextType {
  selectedLongTerm: LongTermItem | null;
  setSelectedLongTerm: (longTerm: LongTermItem | null) => void;
}

const LongTermContext = createContext<LongTermContextType | null>(null);

export const LongTermProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedLongTerm, setSelectedLongTerm] = useState<LongTermItem | null>(
    null
  );

  return (
    <LongTermContext.Provider value={{ selectedLongTerm, setSelectedLongTerm }}>
      {children}
    </LongTermContext.Provider>
  );
};

export const useLongTermContext = () => {
  const context = useContext(LongTermContext);
  if (!context) {
    throw new Error(
      "useLongTermContext must be used within a LongTermProvider"
    );
  }
  return context;
};
