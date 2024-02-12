export interface GitPluginSettings {
	gitRepository: string | null;
}

export const DEFAULT_SETTINGS: GitPluginSettings = {
	gitRepository: null,
};
