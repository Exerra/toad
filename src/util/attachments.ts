import { App, TFile } from "obsidian"

export const getAttachments = (app: App, file: TFile, includeMD: boolean): TFile[] => {
    let linkedFiles: TFile[] = []

    let resolvedLinks = app?.metadataCache.resolvedLinks[file.path]

    if (!resolvedLinks) return linkedFiles

    const linkPaths = Object.keys(resolvedLinks)

    for (let link of linkPaths) {
        const linkedFile = app.vault.getAbstractFileByPath(link) as TFile
        
        if (!linkedFile) continue

        if (linkedFile.extension == "md" && !includeMD) continue

        linkedFiles.push(linkedFile)
    }

    return linkedFiles
}