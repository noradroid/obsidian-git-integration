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
  sync: boolean = false;
  onCompleteCallback: (msg: string, sync: boolean) => void;

  constructor(
    app: App,
    onCompleteCallback: (msg: string, sync: boolean) => void
  ) {
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

    const buttons = new Setting(contentEl)
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

    // setup sync checkbox
    const checkboxContainer: HTMLDivElement = contentEl.createDiv({
      cls: "checkbox-container-w-text",
    });

    const checkbox: HTMLInputElement = contentEl.createEl("input", {
      type: "checkbox",
      attr: {
        id: "sync-checkbox",
      },
    });

    checkbox.addEventListener("change", () => {
      this.sync = checkbox.checked;
    });

    const checkboxText: HTMLLabelElement = contentEl.createEl("label", {
      text: "Automatically push to remote repository",
      cls: "font-small",
      attr: {
        for: "sync-checkbox",
      },
    });

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkboxText);

    buttons.controlEl.insertAdjacentElement("afterbegin", checkboxContainer);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    if (this.commit) {
      this.onCompleteCallback(this.msg, this.sync);
    }
  }
}
