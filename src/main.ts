import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf } from 'obsidian';
import { ReactElement, createElement } from "react"
import { Root, createRoot } from "react-dom/client"
import ChatPane from './ui/chat';
import { AppContext } from './providers/app';
import * as AppView from "./ui/app"
import { OpenAIProvider } from '@ai-sdk/openai';
import { config } from './config';



// Remember to rename these classes and interfaces!

export interface MyPluginSettings {
	apiKey: string;
	model: Parameters<OpenAIProvider>[0]
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	apiKey: '',
	model: "gpt-4o-mini"
}

const VIEW_TYPE = "react-view"

class MyView extends ItemView {
	private reactComponent: ReactElement;
	private root: Root;
	settings: any = {};

	constructor(leaf: WorkspaceLeaf, settings: MyPluginSettings) {
		super(leaf)

		this.settings = settings
	}

	getViewType(): string {
		return VIEW_TYPE
	}

	getDisplayText(): string {
		return config.name
	}

	getIcon(): string {
		return "sparkles"
	}

	async onOpen(): Promise<void> {
		this.reactComponent = createElement(AppView.default, {
			app: this.app,
			settings: this.settings
		})

		const container = this.containerEl.children[1]

		this.root = createRoot(this.containerEl.children[1]);

		this.root.render(this.reactComponent)
	}
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	private view: MyView;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE,
			(leaf: WorkspaceLeaf) => (this.view = new MyView(leaf, this.settings))
		);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');

			this.activateChat()

		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			// console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateChat() {
		const { workspace } = this.app;
		let leaf: WorkspaceLeaf | null = null;
   		const leaves = workspace.getLeavesOfType(VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf!.setViewState({ type: VIEW_TYPE, active: true });
		}
	
		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf!);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('OpenAI API key')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
				.setName("Model")
				.setDesc("Only OpenAI GPT-4 models supported.")
				.addDropdown(dropdown => {
					dropdown.addOption("gpt-4o-mini", "gpt-4o-mini")
					dropdown.addOption("gpt-4o", "gpt-4o")

					dropdown.setValue("gpt-4o-mini")

					dropdown.onChange(async (value) => {
						this.plugin.settings.model = value as typeof this.plugin.settings.model
						await this.plugin.saveSettings()
					})
				})
	}
}
