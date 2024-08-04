import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf, addIcon } from 'obsidian';
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
	model: Parameters<OpenAIProvider>[0],
	google: {
		maps: {
			apiKey: string
		}
	},
	azure: {
		bing: {
			apiKey: string
		}
	},
	limits: {
		getPageContents: number;
	}
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	apiKey: '',
	model: "gpt-4o-mini",
	google: {
		maps: {
			apiKey: ""
		}
	},
	azure: {
		bing: {
			apiKey: ""
		}
	},
	limits: {
		getPageContents: 4
	}
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
		return config.icon
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

		addIcon("krupitis", `<path fill-rule="evenodd" clip-rule="evenodd" d="M2.36745 77.66C-0.789151 74.3462 -0.789151 68.9664 2.36745 65.6545C5.52406 62.3407 10.6486 62.3407 13.8033 65.6545L33.841 86.6904C36.9976 90.0022 36.9976 95.3819 33.841 98.6958C30.6863 102.01 25.5618 102.01 22.4052 98.6958L2.36745 77.66Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M34.4278 99.088C31.2731 102.4 26.1486 102.4 22.992 99.088C19.8354 95.7741 19.8354 90.3944 22.992 87.0806L63.5825 44.4683C66.7391 41.1564 71.8637 41.1564 75.0184 44.4683C78.175 47.7821 78.175 53.1618 75.0184 56.4757L34.4278 99.088Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.0147 34.8041C11.8581 38.1159 6.73358 38.1159 3.57698 34.8041C0.422258 31.4903 0.422258 26.1105 3.57698 22.7967L22.6392 2.78695C25.794 -0.526882 30.9185 -0.526882 34.0751 2.78695C37.2317 6.10077 37.2317 11.4806 34.0751 14.7924L15.0147 34.8041Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M23.1072 15.0222C19.9525 11.7083 19.9525 6.32856 23.1072 3.01671C26.2639 -0.297115 31.3883 -0.297115 34.5449 3.01671L72.3487 42.7034C75.5053 46.0173 75.5053 51.397 72.3487 54.7108C69.194 58.0227 64.0695 58.0227 60.9129 54.7108L23.1072 15.0222Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M84.4584 65.3534C87.6131 62.0396 92.7377 62.0396 95.8943 65.3534C99.0509 68.6652 99.0509 74.045 95.8943 77.3588L75.8565 98.3946C72.6999 101.708 67.5754 101.708 64.4207 98.3946C61.2641 95.0808 61.2641 89.701 64.4207 86.3892L84.4584 65.3534Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M75.2698 86.7794C78.4264 90.0933 78.4264 95.473 75.2698 98.7868C72.1132 102.099 66.9886 102.099 63.8339 98.7868L23.2433 56.1745C20.0867 52.8607 20.0867 47.481 23.2433 44.1671C26.398 40.8553 31.5226 40.8553 34.6792 44.1671L75.2698 86.7794Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M94.6847 22.4955C97.8395 25.8093 97.8395 31.1891 94.6847 34.5029C91.5281 37.8148 86.4036 37.8148 83.247 34.5029L64.1866 14.4912C61.03 11.1794 61.03 5.79959 64.1866 2.48577C67.3432 -0.82806 72.4678 -0.82806 75.6225 2.48577L94.6847 22.4955Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M63.7168 2.71553C66.8734 -0.598293 71.9979 -0.598293 75.1545 2.71553C78.3092 6.02738 78.3092 11.4072 75.1545 14.721L37.3488 54.4096C34.1922 57.7215 29.0677 57.7215 25.913 54.4096C22.7564 51.0958 22.7564 45.7161 25.913 42.4022L63.7168 2.71553Z" fill="currentColor"/>`)

		this.registerView(
			VIEW_TYPE,
			(leaf: WorkspaceLeaf) => (this.view = new MyView(leaf, this.settings))
		);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(config.icon, "Open " + config.name, (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			// new Notice('This is a notice!');

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

		new Setting(containerEl)
			.setName('Google Maps API key')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.google.maps.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.google.maps.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Bing API key')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.azure.bing.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.azure.bing.apiKey = value;
					await this.plugin.saveSettings();
				}));
	}
}
