import { App } from "obsidian";

export const createNote = (path: string, data: string, app: App) => {
    app.vault.create(path, data)
}