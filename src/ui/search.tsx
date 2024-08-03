import { App, FuzzySuggestModal, Notice, SuggestModal, TFile } from "obsidian";

interface Book {
	title: string;
	author: string;
}

const ALL_BOOKS = [
	{
		title: "How to Take Smart Notes",
		author: "Sönke Ahrens",
	},
	{
		title: "Thinking, Fast and Slow",
		author: "Daniel Kahneman",
	},
	{
		title: "Deep Work",
		author: "Cal Newport",
	},
];

export class ExampleModal extends FuzzySuggestModal<TFile> {
	private resolve: (value: TFile | PromiseLike<TFile>) => void;
    private reject: (reason?: any) => void;

	getItems(): TFile[] {
		const files = this.app.vault.getMarkdownFiles()
		return files
	}
	getItemText(item: TFile): string {
		return item.basename
	}
	onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
		new Notice("Selected " + item.basename)
		this.resolve(item)
	}

	openModal(): Promise<TFile> {
		this.open()
		return new Promise((resolve, reject) => {
			this.resolve = resolve
			this.reject = reject
		})
	}

}