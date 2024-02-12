# Obsidian Git Integration Plugin

This is a Git Integration plugin for Obsidian (https://obsidian.md) to allow users to easily backup their obsidian vault on a remote repository.

This plugin works on Windows 10+ and requires Git to be installed in the local system.

- [Open the git menu](#open-the-git-menu)
- [Setup remote repository](#setup-remote-repository)
- [Create a commit](#create-a-commit)
- [Sync with remote repository](#sync-with-remote-repository)

### Open the git menu


Click "Open git menu" ribbon icon.

![Git menu ribbon](docs/images/image.png)

The menu will pop up, which shows options to init, commit or sync.

![Git menu modal](docs/images/image-1.png)

### Setup remote repository

Create an empty repository on GitHub.

Open to the git menu and select "Git init" or open the command palette (Ctrl+P on Windows) and search "Open init repository modal".

![Git init modal](docs/images/image-2.png)

Paste the remote repository url and click "Initialize" to finish setting up.

### Create a commit

Open to the git menu and select "Git commit" or open the command palette (Ctrl+P on Windows) and search "Open commit changes modal".

![Git commit modal](docs/images/image-3.png)

Enter a commit message and click "Commit". This is equivalent to performing `git add .` followed by `git commit -m "<message>"`.

### Sync with remote repository

Open to the git menu and select "Git sync" or open the command palette (Ctrl+P on Windows) and search "Sync with remote repository".

![Git sync modal](docs/images/image-4.png)

Click "Sync" to push new changes to remote.
