import {
	App,
	FileSystemAdapter,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

import simpleGit, { SimpleGit, SimpleGitOptions } from "simple-git";

interface GitPluginSettings {
	gitRepository: string | null;
}

const DEFAULT_SETTINGS: GitPluginSettings = {
	gitRepository: null,
};

export default class GitPlugin extends Plugin {
	settings: GitPluginSettings;

	async onload() {
		git.setup(this.app);

		await this.loadSettings();

		this.addCommitRibbonIcon();

		this.addSyncRibbonIcon();

		this.addInitCommand();

		this.addSyncCommand();

		this.addCommitCommand();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Git Integration Active");

		// // This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: "sample-editor-command",
		// 	name: "Sample editor command",
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection("Sample Editor Command");
		// 	},
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	addCommitRibbonIcon(): void {
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"git-commit-vertical",
			"Git commit",
			(evt: MouseEvent) => {
				new GitCommitModal(this.app).open();
			}
		);
		ribbonIconEl.addClass("my-plugin-ribbon-class");
	}

	addSyncRibbonIcon(): void {
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"git-compare-arrows",
			"Git sync",
			(evt: MouseEvent) => {
				new GitSyncModal(this.app).open();
			}
		);
		ribbonIconEl.addClass("my-plugin-ribbon-class");
	}

	addCommitCommand(): void {
		this.addCommand({
			id: "git-commit",
			name: "Open git commit message modal",
			callback: () => {
				new GitCommitModal(this.app).open();
			},
		});
	}

	addSyncCommand(): void {
		this.addCommand({
			id: "git-sync",
			name: "Sync with remote git repository",
			callback: () => {
				new GitSyncModal(this.app).open();
			},
		});
	}

	addInitCommand(): void {
		this.addCommand({
			id: "git-init",
			name: "Init git repository",
			checkCallback: (checking: boolean) => {
				if (!this.settings.gitRepository) {
					if (!checking) {
						git.get()!.init();

						new GitInitModal(this.app, (repo: string) => {
							this.settings.gitRepository = repo;
						}).open();
					}

					return true;
				}
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class GitInitModal extends Modal {
	repo: string;
	addRemote: boolean = false;
	onCompleteCallback: (repo: string) => any;

	constructor(app: App, onCompleteCallback: (repo: string) => any) {
		super(app);
		this.onCompleteCallback = onCompleteCallback;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Git init" });

		new Setting(contentEl)
			.setName("Git repo url")
			.addText((text) => text.onChange((value) => (this.repo = value)));

		new Setting(contentEl).addButton((btn) =>
			btn.setButtonText("Initialize").onClick(() => {
				if (this.repo) {
					this.addRemote = true;
					this.close();
				}
			})
		);
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
		if (this.addRemote) {
			git.get()!
				.addRemote("origin", this.repo)
				.then(() => {
					new Notice(`Added remote origin "${this.repo}"`);
					this.onCompleteCallback(this.repo);
				})
				.catch((err) => new Notice(err));
		}
	}
}

class GitCommitModal extends Modal {
	msg: string;
	commit: boolean = false;

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Git commit" });

		new Setting(contentEl)
			.setName("Message")
			.addTextArea((text) =>
				text.onChange((value) => (this.msg = value))
			);

		new Setting(contentEl).addButton((btn) =>
			btn.setButtonText("Commit").onClick(() => {
				if (this.msg) {
					this.commit = true;
					this.close();
				}
			})
		);
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
		if (this.commit) {
			git.get()!
				.add("*")
				.commit(this.msg)
				.then(() => {
					new Notice(`Committed "${this.msg}"`);
				})
				.catch((err) => new Notice(err));
		}
	}
}

class GitSyncModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Git sync?" });

		new Setting(contentEl)
			.setHeading()
			.setDesc(`This will sync with the remote branch.`)
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => {
					this.close();
				})
			)
			.addButton((btn) => {
				btn.setButtonText("Sync").onClick(() => {
					// this sync will take a while
					git.get()!
						.pull("origin", git.getBranch() ?? undefined)
						.catch((err) => new Notice(`${err}`))
						.finally(() => {
							git.get()!
								.push("origin", git.getBranch() ?? undefined, [
									"--set-upstream",
								])
								.then(() => {
									new Notice(`Synced with remote branch`);
									this.close();
								})
								.catch((err) => new Notice(`${err}`));
						});
				});
			});
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}

class SettingTab extends PluginSettingTab {
	plugin: GitPlugin;

	constructor(app: App, plugin: GitPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setHeading()
			.setName("Git Integration Plugin - Settings");

		new Setting(containerEl)
			.setName("Git repository url")
			.setDesc(
				"Enter your git repository url (or change it to push to a different url)"
			)
			.addText((text) =>
				text
					.setPlaceholder("git repo url")
					.setValue(this.plugin.settings.gitRepository ?? "")
					.onChange(async (value) => {
						this.plugin.settings.gitRepository = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

const DEFAULT_GIT_OPTIONS: Partial<SimpleGitOptions> = {
	binary: "git",
	trimmed: true,
};

class Git {
	private instance: SimpleGit | null = null;
	private branch: string | null;

	setup(app: App): void {
		if (this.get() === null) {
			git.set(simpleGit(getVaultPath(app), DEFAULT_GIT_OPTIONS));
			this.instance
				?.status()
				.then((status) => (this.branch = status.current));
		}
	}

	set(instance: SimpleGit): void {
		this.instance = instance;
	}

	get(): SimpleGit | null {
		return this.instance;
	}

	getBranch(): string | null {
		return this.branch;
	}
}

const git: Git = new Git();

const getVaultPath = (app: App): string => {
	return (app.vault.adapter as FileSystemAdapter).getBasePath();
};