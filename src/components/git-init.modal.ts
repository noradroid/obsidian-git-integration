import { App, Modal, Setting } from "obsidian";

export class GitInitModal extends Modal {
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
			this.onCompleteCallback(this.repo);
		}
	}
}
