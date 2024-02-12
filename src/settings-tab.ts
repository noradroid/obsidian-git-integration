import { App, PluginSettingTab, Setting } from "obsidian";
import GitPlugin from "src/main";

export class SettingsTab extends PluginSettingTab {
  plugin: GitPlugin;
  onCompleteCallback: () => void;

  constructor(app: App, plugin: GitPlugin, onCompleteCallback: () => void) {
    super(app, plugin);
    this.plugin = plugin;
    this.onCompleteCallback = onCompleteCallback;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setHeading()
      .setName("Git Integration Plugin - Settings");

    new Setting(containerEl)
      .setName("Remote repository url")
      .setDesc(
        "Enter your remote repository url (or change it to push to a different url)"
      )
      .addText((text) =>
        text
          .setPlaceholder("git repo url")
          .setValue(this.plugin.settings.gitRemote ?? "")
          .onChange(async (value) => {
            this.plugin.settings.gitRemote = value;
            await this.plugin.saveSettings();
            this.onCompleteCallback();
          })
      );
  }
}
