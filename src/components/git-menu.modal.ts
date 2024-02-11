import { App, Modal, Setting } from "obsidian";
import { GitCommitModal } from "./git-commit.modal";
import { GitSyncModal } from "./git-sync.modal";

export class GitMenuModal extends Modal {
	constructor(
		app: App,
		private gitCommitModal: GitCommitModal,
		private gitSyncModal: GitSyncModal
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Git menu" });
		contentEl.createEl("span", {
			text: "Choose one of the following options to proceed:",
		});

		new Setting(contentEl)
			.setClass("setting-item-without-info")
			.addButton((button) => {
				button.setButtonText("Git commit");
				button.setClass("w-100").setClass("font-medium");
				button.onClick((evt: MouseEvent) => {
					this.gitCommitModal.open();
					// new GitCommitModal(this.app).open();
					this.close();
				});
			})
			.addButton((button) => {
				button.setButtonText("Git sync");
				button.setClass("w-100").setClass("font-medium");
				button.onClick((evt: MouseEvent) => {
					this.gitSyncModal.open();
					// new GitSyncModal(this.app).open();
					this.close();
				});
			});
		// new Setting(contentEl)
		// 	.setClass("setting-item-without-info")
		// 	.addButton((button) => {
		// 		button.setButtonText("Git sync");
		// 		button.setClass("w-100");
		// 		button.onClick((evt: MouseEvent) =>
		// 			new GitSyncModal(this.app).open()
		// 		);
		// 	});
		// new Setting(contentEl).setName("Git sync").addButton((button) => {
		// 	button.setButtonText("Open");
		// 	button.setClass("w-100");
		// 	button.onClick((evt: MouseEvent) =>
		// 		new GitSyncModal(this.app).open()
		// 	);
		// });
		// new Setting(contentEl)
		// 	.setName("Git sync")
		// 	.addDropdown((dropdown: DropdownComponent) => {
		// 		dropdown.addOptions({
		// 			"git-commit": "Git commit",
		// 			"git-sync": "Git sync",
		// 		});
		// 		dropdown.onChange((value: string) => {
		// 			if (value === "git-commit") {
		// 				new GitCommitModal(this.app).open();
		// 			} else if (value === "git-sync") {
		// 				new GitSyncModal(this.app).open();
		// 			}
		// 		});
		// 	});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
