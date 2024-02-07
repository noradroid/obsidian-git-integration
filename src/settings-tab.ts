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
			.setHeading()
			.setName("Git Integration Plugin - Settings");

		new Setting(containerEl)
			.setName("Git repository url")
			.setDesc(
				"Enter your git repository url (or change it to push to a different url)"
			)
			.addText((text) =>
				text
					.setPlaceholder("git repo url")
					.setValue(this.plugin.settings.gitRepository ?? "")
					.onChange(async (value) => {
						this.plugin.settings.gitRepository = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
