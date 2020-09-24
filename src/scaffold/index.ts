import { exec } from "child_process";
import { writeFile, mkdir } from "fs";
import { join } from "path";
import * as vscode from "vscode";
import { getContents } from "./contents";

const execAsync = (command: string) =>
  new Promise((resolve, reject) => {
    exec(command, { cwd: vscode.workspace.rootPath }, (error) => {
      if (error) {
        reject();
      } else {
        resolve();
      }
    });
  });

const getRootPath = () => {
  const [folder] = vscode.workspace.workspaceFolders || [];
  if (!folder.uri) {
    return;
  }

  return folder.uri.fsPath;
};

const writeFileAsync = (path: string, content: string) =>
  new Promise((resolve, reject) => {
    const rootPath = getRootPath();
    if (!rootPath) {
      reject();
      return;
    }

    writeFile(join(rootPath, path), content, (error) => {
      if (error) {
        reject();
      } else {
        resolve();
      }
    });
  });

const mkdirAsync = (path: string) =>
  new Promise((resolve, reject) => {
    const rootPath = getRootPath();
    if (!rootPath) {
      reject();
      return;
    }

    mkdir(join(rootPath, path), (error) => {
      if (error) {
        reject();
      } else {
        resolve();
      }
    });
  });

const writeContentDeep = async (content: any, path: string = "") =>
  await Promise.all(
    Object.entries(content).map(async ([key, value]) => {
      const currentPath = join(path, key);
      if (typeof value === "string") {
        await writeFileAsync(currentPath, value);
      } else {
        await mkdirAsync(currentPath);
        await writeContentDeep(value, currentPath);
      }
    })
  );

export const scaffoldNewProject = async (
  pkg: any,
  progress: vscode.Progress<{ message?: string; increment?: number }>
) => {
  progress.report({
    message: "new files",
  });

  await writeContentDeep(getContents({ pkg }));

  progress.report({
    message: "dependencies",
  });
  await execAsync("npm install");

  progress.report({
    message: "Fibtit SDK Types",
  });
  await execAsync("npx fitbit-sdk-types");

  try {
    progress.report({
      message: "Git repository",
    });
    await execAsync("git init");
  } catch {}
};
