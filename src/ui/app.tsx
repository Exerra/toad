import type { App as AppType } from "obsidian"
import { AppContext } from "src/providers/app"
import { SettingsContext } from "src/providers/settings"
import ChatPane from "./chat"
import { MyPluginSettings } from "src/main"

interface Props {
    app: AppType,
    settings: MyPluginSettings
}

const App = ({ app, settings }: Props) => {
    return (
        <AppContext.Provider value={app}>
            <SettingsContext.Provider value={settings}>
                <ChatPane />
            </SettingsContext.Provider>
        </AppContext.Provider>
    )
}

export default App