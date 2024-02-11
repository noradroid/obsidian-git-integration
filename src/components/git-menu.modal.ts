import { App, Modal, Setting } from "obsidian";
import { GitCommitModal } from "./git-commit.modal";
import { GitInitModal } from "./git-init.modal";
import { GitSyncModal } from "./git-sync.modal";

export class GitMenuModal extends Modal {
	constructor(
		app: App,
		private gitInitModal: GitInitModal,
		private gitCommitModal: GitCommitModal,
		private gitSyncModal: GitSyncModal
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Git menu" });

		new Setting(contentEl)
			.setClass("setting-item-without-info")
			.addButton((button) => {
				button.setButtonText("Git init");
				button.setClass("w-100").setClass("font-medium");
				button.onClick((evt: MouseEvent) => {
					this.gitInitModal.open();
					this.close();
				});
			});
		new Setting(contentEl)
			.setClass("setting-item-without-info")
			.addButton((button) => {
				button.setButtonText("Git commit");
				button.setClass("w-100").setClass("font-medium");
				button.onClick((evt: MouseEvent) => {
					this.gitCommitModal.open();
					this.close();
				});
			})
			.addButton((button) => {
				button.setButtonText("Git sync");
				button.setClass("w-100").setClass("font-medium");
				button.onClick((evt: MouseEvent) => {
					this.gitSyncModal.open();
					this.close();
				});
			});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
