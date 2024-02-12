import { App } from "obsidian";
import { DebugModal } from "./debug.modal";

export class ErrorModal extends DebugModal {
  contents: string;

  constructor(app: App, contents: string) {
    super(app, contents);
    this.heading = "Git Integration Plugin ran into an error:";
  }
}
