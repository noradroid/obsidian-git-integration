import { Modal, App, Setting, Notice } from "obsidian";
import { git } from "src/config/git.config";
import { DebugModal } from "./debug.modal";

export class GitSyncModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Git sync?" });
		contentEl.createEl("span", {
			text: "This will sync with the remote branch.",
		});

		new Setting(contentEl)
			.setHeading()
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => {
					this.close();
				})
			)
			.addButton((btn) => {
				btn.setButtonText("Sync")
					.setClass("bg-theme")
					.onClick(() => {
						// this sync will take a while
						git.pull()
							.then(() => {
								git.push();
								new Notice(`Synced with remote branch`);
								this.close();
							})
							.catch((err) => {
								new Notice(`${err}`);
								new DebugModal(this.app, err).open();
							});
					});
			});
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
