import { createContext } from "react";
import { CycleItem } from "../types";

const CycleContext = createContext<CycleItem | null>(null);

export default CycleContext;
