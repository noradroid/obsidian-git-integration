import { App, Modal } from "obsidian";

export class DebugModal extends Modal {
  contents: string;
  heading: string = "Git Integration Plugin debug message:";

  constructor(app: App, contents: string) {
    super(app);
    this.contents = contents;
  }

  onOpen(): void {
    const { contentEl } = this;

    contentEl.createEl("h1", {
      text: this.heading,
    });

    contentEl.createEl("span", { text: this.contents });
  }
}
