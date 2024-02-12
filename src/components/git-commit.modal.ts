import {
  App,
  ButtonComponent,
  Modal,
  Setting,
  TextAreaComponent,
} from "obsidian";

export class GitCommitModal extends Modal {
  msg: string;
  commit: boolean = false;
  onCompleteCallback: (msg: string) => void;

  constructor(app: App, onCompleteCallback: (msg: string) => void) {
    super(app);
    this.onCompleteCallback = onCompleteCallback;
  }

  onOpen(): void {
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
            if (this.msg && this.msg.trim().length > 0) {
              this.commit = true;
              this.close();
            }
          })
      );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    if (this.commit) {
      this.onCompleteCallback(this.msg);
    }
  }
}
