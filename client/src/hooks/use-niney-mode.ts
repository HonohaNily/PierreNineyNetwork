import { createContext, useContext } from "react";

type NineyModeContextType = {
  nineyMode: boolean;
  setNineyMode: (mode: boolean) => void;
  nineyCounter: number;
  setNineyCounter: (counter: number | ((prev: number) => number)) => void;
};

export const NineyModeContext = createContext<NineyModeContextType>({
  nineyMode: false,
  setNineyMode: () => {},
  nineyCounter: 42,
  setNineyCounter: () => {}
});

export const useNineyMode = () => {
  return useContext(NineyModeContext);
};
