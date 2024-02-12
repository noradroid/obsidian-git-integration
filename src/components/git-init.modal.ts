import { App, Modal, Setting } from "obsidian";

export class GitInitRemote extends Modal {
  repo: string;
  addRemote: boolean = false;
  onCompleteCallback: (repo: string) => void;

  constructor(app: App, onCompleteCallback: (repo: string) => void) {
    super(app);
    this.onCompleteCallback = onCompleteCallback;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h1", { text: "Git init remote" });

    new Setting(contentEl)
      .setName("Remote repository url")
      .addText((text) =>
        text
          .setPlaceholder("Enter repository url...")
          .onChange((value) => (this.repo = value))
      );

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Initialize")
        .setClass("bg-theme")
        .onClick(() => {
          if (this.repo) {
            this.addRemote = true;
            this.close();
          }
        })
    );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    if (this.addRemote) {
      this.onCompleteCallback(this.repo);
    }
  }
}
