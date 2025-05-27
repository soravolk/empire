import React, { createContext, useContext, useState } from "react";
import { ShortTermItem } from "../types";

interface ShortTermContextType {
  selectedShortTerm: ShortTermItem | null;
  setSelectedShortTerm: (ShortTerm: ShortTermItem | null) => void;
}

const ShortTermContext = createContext<ShortTermContextType | null>(null);

export const ShortTermProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedShortTerm, setSelectedShortTerm] =
    useState<ShortTermItem | null>(null);

  return (
    <ShortTermContext.Provider
      value={{ selectedShortTerm, setSelectedShortTerm }}
    >
      {children}
    </ShortTermContext.Provider>
  );
};

export const useShortTermContext = () => {
  const context = useContext(ShortTermContext);
  if (!context) {
    throw new Error(
      "useShortTermContext must be used within a ShortTermProvider"
    );
  }
  return context;
};
