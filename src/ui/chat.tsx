import { MarkdownRenderer, Notice, TFile } from "obsidian"
import { useState, ChangeEvent, useRef } from "react"
import { useApp } from "src/hooks/app"
import { ExampleModal } from "./search"
import { getAttachments } from "src/util/attachments"
import { createNote } from "src/util/createNote"
import { createOpenAI } from "@ai-sdk/openai"
import { CoreMessage, generateText, ImagePart, tool } from "ai"
import { z } from "zod"
import { useSettings } from "src/hooks/settings"
import { config } from "src/config"

const ChatPane = () => {
    const [ chatVal, setChatVal ] = useState<string>("")
    const [ files, setFile ] = useState<TFile[]>([])
    const [ filesa, setFiles ] = useState<{
        file: TFile,
        attachments: TFile[]
    }[]>([])
    const [ includeBacklinks, setIncludeBacklinks ] = useState<boolean>(false)

    const [ aiChatHistory, setAiChatHistory ] = useState<CoreMessage[]>([])

    const app = useApp()
    const settings = useSettings()
    const mdRef = useRef<HTMLDivElement>(null)

    const reset = () => {
        setFile([])
        setFiles([])
        setAiChatHistory([])

        document.getElementById("ex-ai-markdown")!.innerHTML = ""
    }

    const getResponseSDK = async () => {
        // "Property 'getAllFolders' does not exist on type 'Vault'."
        // yes it does
        // @ts-ignore
        let folders = app?.vault.getAllFolders(true)

        // @ts-ignore
        let foldersArr = []

        for (let folder of folders) {
            foldersArr.push(folder.path)
        }

        const openai = createOpenAI({
            compatibility: "strict",
            apiKey: settings?.apiKey
        })

        let model = openai(settings?.model!)

        let fileValues = []

        for (let i in files) {
            let file = files[i]

            fileValues.push({
				name: file.basename,
                path: file.path,
                content: await file.vault.read(file),
                i: i
            })
        }

		let attachments: {
			name: string,
			path: string,
			content: string,
			reference: TFile,
			extension: string,
			binary: ArrayBuffer,
            inReferenceTo: string | null,
            chunks?: []
		}[] = []


        for (const filea of filesa) {
            const { file } = filea
            const attachmentsa = filea.attachments
            
            let attachment = {
                name: file.basename,
                path: file.path,
                content: await file.vault.read(file),
                reference: file,
                extension: file.extension,
                binary: await file.vault.readBinary(file),
                inReferenceTo: null
            }

            let attachmentAttachments = []

            for (let attachment of attachmentsa) {
                attachmentAttachments.push({
                    name: attachment.basename,
                    path: attachment.path,
                    content: await attachment.vault.read(attachment),
                    reference: attachment,
                    extension: attachment.extension,
                    binary: await attachment.vault.readBinary(attachment),
                    inReferenceTo: file.path
                })
            }

            attachments.push(attachment)
            attachments = [...attachments, ...attachmentAttachments]
        }

		let notes = attachments.filter(a => a.extension == "md")
		let images = attachments.filter(a => a.extension == "png")

        let userDiv = document.getElementById("ex-ai-markdown")?.createDiv("ex-ai-bubble ex-ai-user")

        // @ts-ignore
        MarkdownRenderer.render(app!, chatVal, userDiv!, "", mdRef.current)

        // let noteChunks = notes[0].content
        //     .split("\n")
        //     .map(chunk => chunk.trim())
        //     .filter(chunk => chunk.length > 0)
        
        // const { embeddings } = await embedMany({
        //     model: openai.embedding("text-embedding-3-small"),
        //     values: noteChunks
        // })

        // let db: { embedding: number[]; value: string }[] = []

        // embeddings.forEach((e, i) => {
        //     db.push({
        //         embedding: e,
        //         value: noteChunks[i]
        //     })
        // })

        // const { embedding } = await embed({
        //     model: openai.embedding("text-embedding-3-small"),
        //     value: chatVal
        // })

        // console.log(embeddings, db, embedding)

        // const contexta = db
        //     .map(item => ({
        //         document: item,
        //         similarity: cosineSimilarity(embedding, item.embedding)
        //     }))
        //     .sort((a, b) => b.similarity - a.similarity)
        //     .slice(0, 3)
        //     .map(r => r.document.value)
        //     .join('\n');

        // console.log(contexta)

        let context = ``
		
		if (aiChatHistory.length == 0 && notes.length != 0) context = `---BEGIN IMPORTANT CONTEXT---\nAnticipate the type of answer desired by the user. Imagine the following ${fileValues.length} markdown notes were written by the user and contain necessary information to answer the user's question. Begin responses with "Based on your notes..." unless creating a note. Use Obsidian-flavored markdown when possible and as much as possible. Each attached image is related to the note and is attached in the order that it is referenced in the note.\n${notes.map(val => {return (`---BEGIN NOTE ${val.name} [[${val.path}]]${val.inReferenceTo == null ? "" : ` REFERENCED BY [[${val.inReferenceTo}]]`}---\n${val.content}\n---END NOTE ${val.name} [[${val.path}]]---\n`)})}---END IMPORTANT CONTEXT---\n\n`

		else if (aiChatHistory.length != 0 && notes.length != 0) context = `---BEGIN IMPORTANT CONTEXT---\nA few more notes have been added to the existing prompt. Treat these as new additions to the context.\n${notes.map(val => {return (`---BEGIN NOTE ${val.name} [[${val.path}]]---\n${val.content}\n---END NOTE ${val.name} [[${val.path}]]---\n`)})}---END IMPORTANT CONTEXT---\n\n`

        let parsedImg = images.map(image => ({
            type: "image",
            image: image.binary
        })) as ImagePart[]

        let newMessage = {
            role: "user",
            content: [{ type: "text", text: context + chatVal }, ...parsedImg]
        } as CoreMessage

        let messages = [...aiChatHistory, newMessage]

        console.log(messages)

        await setAiChatHistory(messages)

        setChatVal("")
		fileValues = []
		setFile([])
        setFiles([])
        

        const result = await generateText({
            model,
            system: `The current date and time is ${new Date()}. The user has indicated their locale options as:
            Date: lv_LV
            Currency: lv_LV`,
            tools: {
                createNote: tool({
                    description: "Creates a note in a directory based on the path and content (which does not include the title)",
                    parameters: z.object({
                        // name: z.string().describe("Name of the markdown note. Keep it short. Must be compatible with Android's, iOS, macOS and Linux file naming rules. Do not include the file extension."),
                        // folder: z.string().describe("Full path of the folder in which to save the markdown note. Choose the most appropriate folder and don't ask in which folder, unless specified otherwise. Must be one of the ones returned by the getAllFolders function. Do not include the file name. Do not create folders that don't exist."),
                        path: z.string().describe("Full path of the new Markdown note. Keep the name short. Choose the most appropriate folder and don't ask in which folder, unless specified otherwise. Folder must be one of those returned by the getAllFolders function. Do not create folders that don't exist. Do not put notes in folders that don't exist. Include the file extension."),
                        content: z.string().describe("Content of the note in Obsidian markdown. Don't include the title, the file name is the title. The first heading level is H1.")
                    }),
                    execute: async ({ path, content }) => {
                        // let path = `${folder}/${name}.md`
                        // console.log(name)
                        createNote(path, content, app!)

                        new Notice(path)

                        return "Created a note at: " + path
                    }
                }),

                // seperated in order to not cause high token usage when the create note func isnt needed
                getAllFolders: tool({
                    description: "Get all folders",
                    parameters: z.object({}),
                    execute: async () => {
                        // @ts-ignore
                        return foldersArr.join("\n")
                    }
                })
            },
            maxToolRoundtrips: 10,
            messages: messages,
            maxRetries: 3,
        })

        messages = [...messages, ...result.responseMessages]

        await setAiChatHistory(messages)

        let modelDiv = document.getElementById("ex-ai-markdown")?.createDiv("ex-ai-bubble ex-ai-model")

        // @ts-ignore
		MarkdownRenderer.render(app!, result.text, modelDiv!, "", mdRef.current)

        console.log(messages)
        // console.log(convertToCoreMessages(result.responseMessages))
    }

    const handleChatChange = (e: ChangeEvent<HTMLTextAreaElement>) => {

        let val = e.target.value

        setChatVal(e.target.value)

        if (val.endsWith("[[")) modalAppear()
    }

    const modalAppear = async () => {
		let temp: TFile[] = []

        let searchModal = new ExampleModal(app!)

        let file = await searchModal.openModal()

		let read = await file.vault.read(file)

		let attachments = getAttachments(app!, file, includeBacklinks)

		temp = [...attachments, file]

        setChatVal(chatVal.slice(0, -1))

        let tempo: typeof filesa = []

        tempo = [{
            file,
            attachments
        }]

        setFiles([...filesa, ...tempo])
    }

	const removeFile = async (file: TFile) => {
		let tempFiles = filesa

		tempFiles = tempFiles.filter(f => f.file.path != file.path)
		
		setFiles(tempFiles)
	}

    const handleBacklinksChange = (e: ChangeEvent<HTMLInputElement>) => {

        let val = e.target.checked

        console.log(val)
        console.log(typeof val)

        setIncludeBacklinks(val)
    }

    return (
        <div id="ex-ai">
            <h1 style={{ marginBottom: 0 }}>{config.name}</h1>
            <p>Model - OpenAI gpt-4o-mini</p>
            <br />
            <br />

            <div id="ex-ai-chat">
                <div className="ex-ai-chatbox">
                    <div id="ex-ai-markdown" ref={mdRef}></div>
                </div>

                <div style={{ display: "flex", gap: "5px" }}>
                    <input id={"includeBacklinks"} type={"checkbox"} checked={includeBacklinks} onChange={handleBacklinksChange} />
                    <label htmlFor={"includeBacklinks"}>Include backlinks</label>
                </div>

                <p>Selected files:</p>
                <ul>
                    {filesa.map(file => (
                        <li style={{ display: "flex", width: "full", gap: "50px", verticalAlign: "middle" }}>{file.file.path} <span onClick={() => removeFile(file.file)} style={{ cursor: "pointer", color: "grey" }}>X</span></li> 
                    ))}
                </ul> 

                <div className="ex-ai-input">
                    <textarea id="ex-ai-textarea" value={chatVal} onChange={handleChatChange} />
                    <button onClick={() => {getResponseSDK()}}>↑</button>
                </div>
            </div>
        </div>
    )
}

export default ChatPane