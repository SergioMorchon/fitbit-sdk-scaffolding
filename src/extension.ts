import * as vscode from "vscode";
import { getPackage } from "./create-interactors";
import { scaffoldNewProject } from "./scaffold";

export const activate = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fitbit-sdk-scaffolding.create",
      async () => {
        const pkg = await getPackage();
        if (!pkg) {
          return;
        }

        vscode.window.withProgress(
          {
            cancellable: false,
            location: vscode.ProgressLocation.Notification,
            title: `Creating ${pkg.fitbit.appDisplayName}`,
          },
          (progress) => scaffoldNewProject(pkg, progress)
        );
      }
    ),
    vscode.commands.registerCommand("fitbit-sdk-scaffolding.addTypes", () => {
      const terminal = vscode.window.createTerminal("Fitbit SDK Scaffolding");
      terminal.show();
      terminal.sendText("npx fitbit-sdk-types");
    })
  );
};

export const deactivate = () => {};
