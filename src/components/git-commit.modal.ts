import {
  App,
  ButtonComponent,
  Modal,
  Notice,
  Setting,
  TextAreaComponent,
} from "obsidian";

export class GitCommitModal extends Modal {
  msg: string;
  commit: boolean = false;
  sync: boolean = false;
  prevCommitMsg: string | null;
  onCompleteCallback: (msg: string, sync: boolean) => void;

  constructor(
    app: App,
    prevCommitMsg: string | null,
    onCompleteCallback: (msg: string, sync: boolean) => void
  ) {
    super(app);
    this.prevCommitMsg = prevCommitMsg;
    this.onCompleteCallback = onCompleteCallback;
  }

  onOpen(): void {
    const { contentEl } = this;

    contentEl.createEl("h1", { text: "Git commit" });

    this.setupPrevCommitMsgDisplay(contentEl);

    new Setting(contentEl)
      .setName("Commit message")
      .setClass(this.prevCommitMsg ? "setting-item-no-top-border" : "")
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

  private setupPrevCommitMsgDisplay(contentEl: HTMLElement): void {
    if (this.prevCommitMsg) {
      const prevCommitContainer = contentEl.createDiv(
        "setting-item prev-commit-container"
      );
      const settingName = contentEl.createDiv({
        text: "Previous commit",
        cls: "setting-item-name",
      });
      prevCommitContainer.appendChild(settingName);

      const copyContainer: HTMLDivElement = contentEl.createDiv({
        cls: "copy-container w-100",
      });
      const msgContainer: HTMLDivElement = contentEl.createDiv({
        text: this.prevCommitMsg,
        cls: "msg",
      });

      const icon = contentEl.createEl("div", { cls: "clickable-icon" });
      icon.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

      icon.addEventListener("click", () => {
        if (this.prevCommitMsg) {
          navigator.clipboard.writeText(this.prevCommitMsg);
          new Notice("Copied to clipboard");
        }
      });
      copyContainer.appendChild(msgContainer);
      copyContainer.appendChild(icon);
      prevCommitContainer.appendChild(copyContainer);
    }
  }
}
