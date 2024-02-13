import { App, PluginSettingTab, Setting } from "obsidian";
import GitPlugin from "src/main";

export class SettingsTab extends PluginSettingTab {
  plugin: GitPlugin;

  constructor(app: App, plugin: GitPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Remote repository url")
      .setDesc(
        "Enter your remote repository url (or change it to push to a different url)"
      )
      .addText((text) =>
        text
          .setPlaceholder("Remote repository url")
          .setValue(this.plugin.settings.gitRemote ?? "")
          .onChange(async (value) => {
            this.plugin.settings.gitRemote = value;
            await this.plugin.saveSettings();
            if (this.plugin.settings.gitRemote) {
              this.plugin.git.addRemote(this.plugin.settings.gitRemote);
            }
          })
      );
  }
}
