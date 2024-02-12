import { App, Modal, Setting } from "obsidian";

export class DeleteGitFolderModal extends Modal {
  onCompleteCallback: () => void;

  constructor(app: App, onCompleteCallback: () => void) {
    super(app);
    this.onCompleteCallback = onCompleteCallback;
  }

  onOpen(): void {
    const { contentEl } = this;

    contentEl.createEl("h1", {
      text: "Are you sure to delete .git folder?",
    });

    new Setting(contentEl)
      .setClass("setting-item-without-info")
      .addButton((btn) =>
        btn.setButtonText("Cancel").onClick(() => {
          this.close();
        })
      )
      .addButton((btn) => {
        btn
          .setButtonText("Delete")
          .setClass("bg-theme")
          .onClick(() => {
            this.onCompleteCallback();
            this.close();
          });
      });
  }
}
