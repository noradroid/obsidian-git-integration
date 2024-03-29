import { App, Modal, Setting } from "obsidian";

export class GitSyncModal extends Modal {
  onCompleteCallback: () => void;

  constructor(app: App, onCompleteCallback: () => void) {
    super(app);
    this.onCompleteCallback = onCompleteCallback;
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
        btn
          .setButtonText("Sync")
          .setClass("bg-theme")
          .onClick(() => {
            this.onCompleteCallback();
            this.close();
          });
      });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
