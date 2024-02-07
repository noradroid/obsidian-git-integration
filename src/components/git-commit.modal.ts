import { Modal, App, Setting, Notice } from "obsidian";
import { git } from "src/config/git.config";

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
