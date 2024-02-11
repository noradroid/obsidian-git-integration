import {
	Modal,
	App,
	Setting,
	Notice,
	TextAreaComponent,
	ButtonComponent,
} from "obsidian";
import { git } from "src/git/git";

export class GitCommitModal extends Modal {
	msg: string;
	commit: boolean = false;

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Git commit" });

		new Setting(contentEl)
			.setName("Commit message")
			.addTextArea((comp: TextAreaComponent) => {
				comp.setPlaceholder("Enter commit message...");
				comp.onChange((value) => (this.msg = value));
			})
			.setClass("modal-setting-item-w-text-area");

		new Setting(contentEl)
			.addButton((btn: ButtonComponent) =>
				btn.setButtonText("Cancel").onClick(() => {
					this.close();
				})
			)
			.addButton((btn: ButtonComponent) =>
				btn
					.setButtonText("Commit")
					.setClass("bg-theme")
					.onClick(() => {
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
