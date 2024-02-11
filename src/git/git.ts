import simpleGit, {
	SimpleGitOptions,
	SimpleGit,
	PullResult,
	PushResult,
	GitResponseError,
	PullDetailSummary,
	PushDetail,
	CommitResult,
	Response,
	InitResult,
} from "simple-git";

export const DEFAULT_GIT_OPTIONS: Partial<SimpleGitOptions> = {
	binary: "git",
	trimmed: true,
};

export class Git {
	private _instance: SimpleGit | null = null;

	private get instance(): SimpleGit {
		if (this._instance === null || this._instance === undefined) {
			throw new Error("Git instance is not instantiated");
		}
		return this._instance;
	}

	private set instance(inst: SimpleGit) {
		this._instance = inst;
	}

	private branch: string | null = null;

	constructor(baseDir: string) {
		this.instance = simpleGit({
			...DEFAULT_GIT_OPTIONS,
			baseDir,
		});
		this.instance
			?.status()
			.then((status) => (this.branch = status.current));
	}

	getBranch(): string | null {
		return this.branch;
	}

	addAllAndCommit(msg: string): Response<CommitResult> {
		return this.instance.add("*").commit(msg);
	}

	initAndAddRemote(repo: string): Response<string> {
		return this.instance.init().addRemote("origin", repo);
	}

	pull(): Promise<void | PullResult> {
		return this.instance
			.pull("origin", this.getBranch() ?? undefined)
			.catch((err: GitResponseError<PullDetailSummary>) => {
				if (err.message !== "couldn't find remote ref master") {
					throw new Error(err.message);
				}
			});
	}

	push(): Promise<PushResult> {
		return this.instance
			.push("origin", this.getBranch() ?? undefined, ["--set-upstream"])
			.catch((err: GitResponseError<PushDetail>) => {
				throw new Error(err.message);
			});
	}
}
