import { exec } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import * as vscode from "vscode";

const execAsync = (command: string): Promise<void> =>
  new Promise((resolve, reject) => {
    exec(command, { cwd: vscode.workspace.rootPath }, (error) => {
      if (error) {
        reject();
      } else {
        resolve();
      }
    });
  });

export const scaffoldNewProject = async (pkg: any) => {
  writeFileSync(
    `${vscode.workspace.rootPath}/package.json`,
    JSON.stringify(pkg, null, "\t")
  );

  writeFileSync(
    `${vscode.workspace.rootPath}/tsconfig.json`,
    `{
  "extends": "./node_modules/@fitbit/sdk/sdk-tsconfig.json"
}`
  );

  mkdirSync(`${vscode.workspace.rootPath}/app`);
  writeFileSync(
    `${vscode.workspace.rootPath}/app/index.ts`,
    `console.log('Hello, world')`
  );

  mkdirSync(`${vscode.workspace.rootPath}/companion`);
  writeFileSync(
    `${vscode.workspace.rootPath}/companion/index.ts`,
    `import { settingsStorage } from 'settings';

settingsStorage.setItem('myProp', 'Hello, world');
console.log('Hello, world')`
  );

  mkdirSync(`${vscode.workspace.rootPath}/settings`);
  writeFileSync(
    `${vscode.workspace.rootPath}/settings/index.tsx`,
    `registerSettingsPage(({ settings: { myProp } }) => (
    <Page>
        <Section title="Settings">{myProp && <Text>{myProp}</Text>}</Section>
    </Page>
));`
  );

  mkdirSync(`${vscode.workspace.rootPath}/resources`);
  writeFileSync(
    `${vscode.workspace.rootPath}/resources/index.gui`,
    "<svg></svg>"
  );
  writeFileSync(`${vscode.workspace.rootPath}/resources/styles.css`, "");
  writeFileSync(
    `${vscode.workspace.rootPath}/resources/widgets.gui`,
    `<svg>
  <defs>
    <link rel="stylesheet" href="styles.css" />
    <link rel="import" href="/mnt/sysassets/widgets_common.gui" />
  </defs>
</svg>`
  );

  writeFileSync(
    `${vscode.workspace.rootPath}/.gitignore`,
    `node_modules
build`
  );

  await execAsync("npm install");
  await execAsync("npx fitbit-sdk-types");
  try {
    await execAsync("git init");
  } catch {}
};
