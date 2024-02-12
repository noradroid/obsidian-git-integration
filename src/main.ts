import { Notice, Plugin } from "obsidian";
import { CommitResult } from "simple-git";
import { GitCommitModal } from "./components/git-commit.modal";
import { GitInitRemote } from "./components/git-init.modal";
import { GitMenuModal } from "./components/git-menu.modal";
import { GitSyncModal } from "./components/git-sync.modal";
import { DEFAULT_SETTINGS, IS_DEBUG_MODE } from "./config/config";
import { GitPluginSettings } from "./config/plugin-settings.model";
import { DebugModal } from "./debug/debug.modal";
import { DeleteGitFolderModal } from "./debug/delete-git-folder.modal";
import { ErrorModal } from "./debug/error.modal";
import { deleteGitFolder } from "./debug/utils/delete-folder";
import { openFolder } from "./debug/utils/open-folder";
import { Git } from "./git/git";
import { SettingsTab } from "./settings-tab";
import { getVaultPath } from "./utils/utils";

export default class GitPlugin extends Plugin {
  settings: GitPluginSettings;
  git: Git;

  get menuModal(): GitMenuModal {
    return new GitMenuModal(
      this.app,
      this.settings.gitRemote ? null : this.initRemoteModal,
      this.commitModal,
      this.syncModal
    );
  }

  get initRemoteModal(): GitInitRemote {
    return new GitInitRemote(this.app, (repo: string) => {
      this.git
        .addRemote(repo)
        .then(() => {
          new Notice(`Added remote origin "${repo}"`);
          this.updateRemoteRepository(repo);
        })
        .catch((err) => new Notice(err));
    });
  }

  get commitModal(): GitCommitModal {
    return new GitCommitModal(this.app, (msg: string) => {
      this.git
        .addAllAndCommit(msg)
        .then((res: CommitResult) => {
          if (res.commit) {
            new Notice(`Committed "${msg}"`);
          } else {
            new Notice(`No changes to commit`);
          }
        })
        .catch((err) => new Notice(err));
    });
  }

  get syncModal(): GitSyncModal {
    return new GitSyncModal(this.app, () => {
      // this sync will take a while
      this.git
        .push()
        .then((res) => {
          console.log(res);
          if (
            res.update ||
            (res.pushed.length > 0 && res.pushed[0].new === true)
          ) {
            new Notice(`Pushed new changes to remote branch`);
          } else {
            new Notice("No changes to push");
          }
        })
        .catch((err) => {
          this.openDebugModal(err, "ERROR");
          new Notice(err);
        });
      // this.git
      //   .pull()
      //   .then(() => {
      //     this.git.push();
      //     new Notice(`Synced with remote branch`);
      //   })
      //   .catch((err: string) => {
      //     this.openDebugModal(err, "ERROR");
      //     new Notice(err);
      //   });
    });
  }

  async onload() {
    try {
      this.git = new Git(getVaultPath(this.app));

      await this.loadSettings();

      this.addSettingsPage();
      this.addMenuRibbonIcon();
      this.addOpenInitModalCommand();
      this.addSyncCommand();
      this.addOpenCommitModalCommand();
      this.addStatusBarIndication();

      if (IS_DEBUG_MODE) {
        this.addOpenFolderRibbonIcon();
        this.addDeleteGitFolderRibbonIcon();
      }

      // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
      // Using this function will automatically remove the event listener when this plugin is disabled.
      this.registerDomEvent(document, "click", (evt: MouseEvent) => {
        console.log("click", evt);
      });
    } catch (err) {
      this.openDebugModal(err, "ERROR");
      new Notice(err);
    }
  }

  addMenuRibbonIcon(): void {
    this.addRibbonIcon("git-compare-arrows", "Open git menu", () => {
      this.menuModal.open();
    });
  }

  // addCommitRibbonIcon(): void {
  // 	const ribbonIconEl = this.addRibbonIcon(
  // 		"git-commit-vertical",
  // 		"Git commit",
  // 		(evt: MouseEvent) => {
  // 			new GitCommitModal(this.app).open();
  // 		}
  // 	);
  // 	ribbonIconEl.addClass("my-plugin-ribbon-class");
  // }

  // addSyncRibbonIcon(): void {
  // 	const ribbonIconEl = this.addRibbonIcon(
  // 		"git-compare-arrows",
  // 		"Git sync",
  // 		(evt: MouseEvent) => {
  // 			new GitSyncModal(this.app).open();
  // 		}
  // 	);
  // 	ribbonIconEl.addClass("my-plugin-ribbon-class");
  // }

  addOpenMenuCommand(): void {
    this.addCommand({
      id: "git-menu",
      name: "Open git menu",
      callback: () => {
        this.menuModal.open();
      },
    });
  }

  addOpenInitModalCommand(): void {
    this.addCommand({
      id: "git-init",
      name: "Open init repository modal",
      checkCallback: (checking: boolean) => {
        if (!this.settings.gitRemote) {
          if (!checking) {
            this.initRemoteModal.open();
          }

          return true;
        }
      },
    });
  }

  addOpenCommitModalCommand(): void {
    this.addCommand({
      id: "git-commit",
      name: "Open commit changes modal",
      callback: () => {
        this.commitModal.open();
      },
    });
  }

  addSyncCommand(): void {
    this.addCommand({
      id: "git-sync",
      name: "Sync with remote repository",
      callback: () => {
        this.syncModal.open();
      },
    });
  }

  addStatusBarIndication(): void {
    // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    const statusBarItemEl = this.addStatusBarItem();
    statusBarItemEl.setText("Git Integration Active");
  }

  addSettingsPage(): void {
    this.addSettingTab(
      new SettingsTab(this.app, this, () => {
        if (this.settings.gitRemote) {
          this.git.addRemote(this.settings.gitRemote);
        }
      })
    );
  }

  openDebugModal(
    content: string | null,
    mode: "ERROR" | "DEBUG" = "DEBUG"
  ): void {
    if (IS_DEBUG_MODE && content) {
      switch (mode) {
        case "ERROR": {
          new ErrorModal(this.app, content).open();
          break;
        }
        default: {
          new DebugModal(this.app, content).open();
        }
      }
    }
  }

  /**
   * Open vault base folder.
   */
  addOpenFolderRibbonIcon(): void {
    this.addRibbonIcon("folder-open", "Open folder in file explorer", () => {
      openFolder(getVaultPath(this.app));
    });
  }

  /**
   * Delete .git folder
   */
  addDeleteGitFolderRibbonIcon(): void {
    this.addRibbonIcon("trash", "Delete .git folder", () => {
      new DeleteGitFolderModal(this.app, () => {
        deleteGitFolder(getVaultPath(this.app));
        this.updateRemoteRepository();
      }).open();
    });
  }

  updateRemoteRepository(repo?: string | null): void {
    this.settings.gitRemote = repo ?? "";
    this.saveSettings();
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    const gitRemote = await this.git.getRemote();
    if (gitRemote && !this.settings.gitRemote) {
      this.updateRemoteRepository(gitRemote);
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
