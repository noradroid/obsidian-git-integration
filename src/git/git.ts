import simpleGit, {
  CommitResult,
  GitResponseError,
  PullDetailSummary,
  PullResult,
  PushDetail,
  PushResult,
  Response,
  SimpleGit,
  SimpleGitOptions,
} from "simple-git";

export const DEFAULT_GIT_OPTIONS: Partial<SimpleGitOptions> = {
  binary: "git",
  trimmed: true,
};

export class Git {
  private _instance: SimpleGit | null = null;
  private REMOTE_NAME: "origin" = "origin";

  private get instance(): SimpleGit {
    if (!this._instance) {
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
    }).init();
    this.instance
      .status()
      .then((status) => {
        this.branch = status.current;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getBranch(): string | null {
    return this.branch;
  }

  async getRemote(): Promise<string | null> {
    const remotes = await this.instance.getRemotes(true);
    // console.log(
    //   await this.instance.listRemote(["--heads", "--tags"], console.log)
    // );
    if (remotes.length > 0) {
      return (
        remotes.find((remote) => remote.name === this.REMOTE_NAME)?.refs.push ??
        null
      );
    } else {
      return null;
    }
  }

  addRemote(repo: string): Promise<string> {
    return this.getRemote()
      .then((remote) => {
        if (remote !== null) {
          this.instance.removeRemote(this.REMOTE_NAME);
        }
      })
      .then(() => this.instance.addRemote(this.REMOTE_NAME, repo));
  }

  addAllAndCommit(msg: string): Response<CommitResult> {
    return this.instance.add("*").commit(msg);
  }

  addAllAndCommitAndPush(msg: string): Promise<PushResult | null> {
    return this.addAllAndCommit(msg)
      .then((res: CommitResult) => {
        if (res.commit) {
          return this.push();
        } else {
          return null;
        }
      })
      .catch((err: GitResponseError<PushDetail>) => {
        throw new Error(err.message);
      });
  }

  pull(): Promise<void | PullResult> {
    return this.instance
      .pull(this.REMOTE_NAME, this.getBranch() ?? undefined)
      .catch((err: GitResponseError<PullDetailSummary>) => {
        if (err.message !== "couldn't find remote ref master") {
          throw new Error(err.message);
        }
      });
  }

  push(): Promise<PushResult> {
    return this.instance
      .push(this.REMOTE_NAME, this.getBranch() ?? undefined, ["--set-upstream"])
      .catch((err: GitResponseError<PushDetail>) => {
        throw new Error(err.message);
      });
  }

  getLatestCommitMsg(): Promise<string | null> {
    return this.instance.log().then((log) => {
      return log.latest?.message ?? null;
    });
  }
}
