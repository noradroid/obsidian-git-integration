import * as fs from "fs";
import * as path from "path";

const deleteFolder = (folderPath: string) => {
  fs.rm(folderPath, { recursive: true, force: true }, () => {});
};

export const deleteGitFolder = (folderPath: string) => {
  deleteFolder(path.resolve(folderPath, ".git"));
};
