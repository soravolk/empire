import { createContext, useContext, useState } from "react";
import { CycleItem } from "../types";

interface CycleListContextType {
  cycleList: CycleItem[] | null;
  setCycleList: React.Dispatch<React.SetStateAction<CycleItem[] | null>>;
}

interface CycleListProviderProps {
  children: React.ReactNode;
}

export const CycleItemContext = createContext<CycleItem | null>(null);

const CycleListContext = createContext<CycleListContextType | null>(null);

export const CycleListProvider = ({ children }: CycleListProviderProps) => {
  const [cycleList, setCycleList] = useState<CycleItem[] | null>(null);

  return (
    <CycleListContext.Provider value={{ cycleList, setCycleList }}>
      {children}
    </CycleListContext.Provider>
  );
};

export const useCycleListContext = () => {
  const context = useContext(CycleListContext);
  if (!context) {
    throw new Error(
      "useCycleListContext must be used within a CycleListProvider"
    );
  }
  return context;
};
