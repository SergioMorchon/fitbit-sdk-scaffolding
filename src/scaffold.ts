import { exec } from "child_process";
import { writeFile, mkdir } from "fs";
import { join } from "path";
import * as vscode from "vscode";

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

export const scaffoldNewProject = async (
  pkg: any,
  progress: vscode.Progress<{ message?: string; increment?: number }>
) => {
  progress.report({
    message: "new files",
  });
  await Promise.all([
    mkdirAsync("app"),
    mkdirAsync("companion"),
    mkdirAsync("settings"),
    mkdirAsync("resources"),
  ]);

  await Promise.all([
    writeFileAsync(
      ".gitignore",
      `node_modules
build`
    ),
    writeFileAsync("package.json", JSON.stringify(pkg, null, "\t")),
    writeFileAsync(
      "tsconfig.json",
      `{
  "extends": "./node_modules/@fitbit/sdk/sdk-tsconfig.json"
}`
    ),
    writeFileAsync(join("app", "index.ts"), `console.log('Hello, world')`),
    writeFileAsync(
      join("companion", "index.ts"),
      `import { settingsStorage } from 'settings';

settingsStorage.setItem('myProp', 'Hello, world');
console.log('Hello, world')`
    ),
    writeFileAsync(
      join("settings", "index.tsx"),
      `registerSettingsPage(({ settings: { myProp } }) => (
    <Page>
        <Section title="Settings">{myProp && <Text>{myProp}</Text>}</Section>
    </Page>
));`
    ),
    writeFileAsync(join("resources", "index.gui"), "<svg></svg>"),
    writeFileAsync(join("resources", "styles.css"), ""),
    writeFileAsync(
      join("resources", "widgets.gui"),
      `<svg>
  <defs>
    <link rel="stylesheet" href="styles.css" />
    <link rel="import" href="/mnt/sysassets/widgets_common.gui" />
  </defs>
</svg>`
    ),
  ]);

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
