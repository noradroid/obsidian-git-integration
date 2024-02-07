import { Plugin } from "obsidian";
import { GitCommitModal } from "./components/git-commit.modal";
import { GitInitModal } from "./components/git-init.modal";
import { GitMenuModal } from "./components/git-menu.modal";
import { GitSyncModal } from "./components/git-sync.modal";
import { git } from "./config/git.config";
import { DEFAULT_SETTINGS, GitPluginSettings } from "./config/settings.config";
import { SettingsTab } from "./settings-tab";

export default class GitPlugin extends Plugin {
	settings: GitPluginSettings;

	async onload() {
		git.setup(this.app);

		await this.loadSettings();

		this.addMenuRibbonIcon();

		// this.addCommitRibbonIcon();

		// this.addSyncRibbonIcon();

		this.addOpenInitModalCommand();

		this.addSyncCommand();

		this.addOpenCommitModalCommand();

		this.addStatusBarIndication();

		this.addSettingsPage();

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

	addMenuRibbonIcon(): void {
		this.addRibbonIcon(
			"git-compare-arrows",
			"Open git menu",
			(evt: MouseEvent) => {
				new GitMenuModal(this.app).open();
			}
		);
	}

	// addCommitRibbonIcon(): void {
	// 	const ribbonIconEl = this.addRibbonIcon(
	// 		"git-commit-vertical",
	// 		"Git commit",
	// 		(evt: MouseEvent) => {
	// 			new GitCommitModal(this.app).open();
	// 		}
	// 	);
	// 	ribbonIconEl.addClass("my-plugin-ribbon-class");
	// }

	// addSyncRibbonIcon(): void {
	// 	const ribbonIconEl = this.addRibbonIcon(
	// 		"git-compare-arrows",
	// 		"Git sync",
	// 		(evt: MouseEvent) => {
	// 			new GitSyncModal(this.app).open();
	// 		}
	// 	);
	// 	ribbonIconEl.addClass("my-plugin-ribbon-class");
	// }

	addOpenMenuCommand(): void {
		this.addCommand({
			id: "git-menu",
			name: "Open git menu",
			callback: () => {
				new GitMenuModal(this.app).open();
			},
		});
	}

	addOpenInitModalCommand(): void {
		this.addCommand({
			id: "git-init",
			name: "Open init repository modal",
			checkCallback: (checking: boolean) => {
				if (!this.settings.gitRepository) {
					if (!checking) {
						git.get()!.init();

						new GitInitModal(this.app, (repo: string) => {
							this.settings.gitRepository = repo;
							this.saveSettings();
						}).open();
					}

					return true;
				}
			},
		});
	}

	addOpenCommitModalCommand(): void {
		this.addCommand({
			id: "git-commit",
			name: "Open commit changes modal",
			callback: () => {
				new GitCommitModal(this.app).open();
			},
		});
	}

	addSyncCommand(): void {
		this.addCommand({
			id: "git-sync",
			name: "Sync with remote repository",
			callback: () => {
				new GitSyncModal(this.app).open();
			},
		});
	}

	addStatusBarIndication(): void {
		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Git Integration Active");
	}

	addSettingsPage(): void {
		this.addSettingTab(new SettingsTab(this.app, this));
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
