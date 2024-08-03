import { createContext } from "react";
import { App } from "obsidian";
import { MyPluginSettings } from "src/main";

export const AppContext = createContext<App | undefined>(undefined);