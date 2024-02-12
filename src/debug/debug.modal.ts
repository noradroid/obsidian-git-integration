import { App, Modal } from "obsidian";

export class DebugModal extends Modal {
	contents: string;

	constructor(app: App, contents: string) {
		super(app);
		this.contents = contents;
	}

	onOpen(): void {
		const { contentEl } = this;

		contentEl.createEl("h1", {
			text: "Git Integration Plugin ran into an error:",
		});

		contentEl.createEl("span", { text: this.contents });
	}
}
