import { App, FileSystemAdapter } from "obsidian";
import simpleGit, {
	SimpleGitOptions,
	SimpleGit,
	PullResult,
	PushResult,
	GitResponseError,
	PullDetailSummary,
	PushDetail,
} from "simple-git";

export const DEFAULT_GIT_OPTIONS: Partial<SimpleGitOptions> = {
	binary: "git",
	trimmed: true,
};

export class Git {
	private instance: SimpleGit | null = null;
	private branch: string | null;

	setup(app: App): void {
		if (this.get() === null) {
			git.set(simpleGit(getVaultPath(app), DEFAULT_GIT_OPTIONS));
			this.instance
				?.status()
				.then((status) => (this.branch = status.current));
		}
	}

	set(instance: SimpleGit): void {
		this.instance = instance;
	}

	get(): SimpleGit | null {
		return this.instance;
	}

	getBranch(): string | null {
		return this.branch;
	}

	pull(): Promise<void | PullResult> {
		if (this.instance === null) {
			throw new Error("Git instance is not initialised");
		}
		return this.instance
			.pull("origin", this.getBranch() ?? undefined)
			.catch((err: GitResponseError<PullDetailSummary>) => {
				if (err.message !== "couldn't find remote ref master") {
					throw new Error(err.message);
				}
			});
	}

	push(): Promise<PushResult> {
		if (this.instance === null) {
			throw new Error("Git instance is not initialised");
		}
		return this.instance
			.push("origin", this.getBranch() ?? undefined, ["--set-upstream"])
			.catch((err: GitResponseError<PushDetail>) => {
				throw new Error(err.message);
			});
	}
}

export const git: Git = new Git();

const getVaultPath = (app: App): string => {
	return (app.vault.adapter as FileSystemAdapter).getBasePath();
};
