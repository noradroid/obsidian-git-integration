import { Notice, Plugin } from "obsidian";
import { CommitResult } from "simple-git";
import { GitCommitModal } from "./components/git-commit.modal";
import { GitInitModal } from "./components/git-init.modal";
import { GitMenuModal } from "./components/git-menu.modal";
import { GitSyncModal } from "./components/git-sync.modal";
import { IS_DEBUG_MODE, DEFAULT_SETTINGS } from "./config/config";
import { GitPluginSettings } from "./config/plugin-settings.model";
import { DebugModal } from "./debug/debug.modal";
import { Git } from "./git/git";
import { SettingsTab } from "./settings-tab";
import { getVaultPath } from "./utils/utils";

export default class GitPlugin extends Plugin {
  settings: GitPluginSettings;
  git: Git;

  get initModal(): GitInitModal {
    return new GitInitModal(this.app, (repo: string) => {
      this.git
        .initAndAddRemote(repo)
        .then(() => {
          new Notice(`Added remote origin "${repo}"`);
          this.settings.gitRepository = repo;
          this.saveSettings();
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
          if (res.update) {
            new Notice(`Pushed new changes to remote branch`);
          } else {
            new Notice("No changes to push");
          }
        })
        .catch((err) => {
          this.openDebugModal(err);
          new Notice(err);
        });
      // this.git
      //   .pull()
      //   .then(() => {
      //     this.git.push();
      //     new Notice(`Synced with remote branch`);
      //   })
      //   .catch((err: string) => {
      //     this.openDebugModal(err);
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

      // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
      // Using this function will automatically remove the event listener when this plugin is disabled.
      this.registerDomEvent(document, "click", (evt: MouseEvent) => {
        console.log("click", evt);
      });
    } catch (err) {
      this.openDebugModal(err);
      new Notice(err);
    }
  }

  addMenuRibbonIcon(): void {
    this.addRibbonIcon("git-compare-arrows", "Open git menu", () => {
      new GitMenuModal(
        this.app,
        this.initModal,
        this.commitModal,
        this.syncModal
      ).open();
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
        new GitMenuModal(
          this.app,
          this.initModal,
          this.commitModal,
          this.syncModal
        ).open();
      },
    });
  }

  addOpenInitModalCommand(): void {
    this.addCommand({
      id: "git-init",
      name: "Open init repository modal",
      checkCallback: (checking: boolean) => {
        if (!this.settings.gitRepository) {
          if (!checking) {
            this.initModal.open();
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
    this.addSettingTab(new SettingsTab(this.app, this));
  }

  openDebugModal(err: string): void {
    if (IS_DEBUG_MODE) {
      new DebugModal(this.app, err).open();
    }
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
