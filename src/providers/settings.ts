import { createContext } from "react";
import { MyPluginSettings } from "src/main";

export const SettingsContext = createContext<MyPluginSettings | undefined>(undefined)