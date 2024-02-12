import { App, Modal, Setting } from "obsidian";
import { GitCommitModal } from "./git-commit.modal";
import { GitInitRemote } from "./git-init.modal";
import { GitSyncModal } from "./git-sync.modal";

export class GitMenuModal extends Modal {
  constructor(
    app: App,
    private gitInitModal: GitInitRemote,
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
        button.onClick(() => {
          this.gitInitModal.open();
          this.close();
        });
      });
    new Setting(contentEl)
      .setClass("setting-item-without-info")
      .addButton((button) => {
        button.setButtonText("Git commit");
        button.setClass("w-100").setClass("font-medium");
        button.onClick(() => {
          this.gitCommitModal.open();
          this.close();
        });
      })
      .addButton((button) => {
        button.setButtonText("Git sync");
        button.setClass("w-100").setClass("font-medium");
        button.onClick(() => {
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
