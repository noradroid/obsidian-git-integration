import { App, FileSystemAdapter } from "obsidian";

export const getVaultPath = (app: App): string => {
	if (app.vault.adapter instanceof FileSystemAdapter) {
		return app.vault.adapter.getBasePath();
	}
	throw new Error(
		"Unable to get vault base path as vault is not within a valid file system"
	);
};
