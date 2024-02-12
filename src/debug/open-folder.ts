import * as childProcess from "child_process";

export const openFolder = (path: string) => {
  childProcess.exec(`start "" "${path}"`);
};
