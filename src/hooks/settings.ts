import { useContext } from "react";
import { SettingsContext } from "../providers/settings";
import { MyPluginSettings } from "src/main";

export const useSettings = (): MyPluginSettings | undefined => {
  return useContext(SettingsContext);
};