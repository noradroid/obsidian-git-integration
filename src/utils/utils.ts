import { App, FileSystemAdapter } from "obsidian";

export const getVaultPath = (app: App): string => {
	return (app.vault.adapter as FileSystemAdapter).getBasePath();
};
