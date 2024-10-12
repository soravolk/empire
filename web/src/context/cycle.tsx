import { createContext } from "react";
import { CycleItem } from "../types";

export const CycleItemContext = createContext<CycleItem | null>(null);
