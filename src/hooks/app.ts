import { App } from "obsidian";
import { useContext } from "react";
import { AppContext } from "../providers/app";

export const useApp = (): App | undefined => {
  return useContext(AppContext);
};