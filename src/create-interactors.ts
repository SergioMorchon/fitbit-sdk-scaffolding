import * as vscode from "vscode";
import { v4 as uuidv4 } from "uuid";

const availableSdkVersions = ["5.0", "4.2"];

const getSdkVersion = (): Promise<string | void> =>
  new Promise((resolve) => {
    const picker = vscode.window.createQuickPick();
    picker.ignoreFocusOut = true;
    picker.items = availableSdkVersions.map((label) => ({ label }));
    picker.title = "SDK Version";

    picker.onDidAccept(() => {
      resolve(picker.selectedItems[0].label);
      picker.hide();
    });
    picker.onDidHide(() => {
      resolve();
    });
    picker.show();
  });

const availableAppTypes = ["app", "clockface"];

const getAppType = (): Promise<string | void> =>
  new Promise((resolve) => {
    const picker = vscode.window.createQuickPick();
    picker.ignoreFocusOut = true;
    picker.items = availableAppTypes.map((label) => ({ label }));
    picker.title = "App type";

    picker.onDidAccept(() => {
      resolve(picker.selectedItems[0].label);
      picker.hide();
    });
    picker.onDidHide(() => {
      resolve();
    });
    picker.show();
  });

const getAppDisplayName = (): Promise<string | void> =>
  new Promise((resolve) => {
    const input = vscode.window.createInputBox();
    input.placeholder = "Display name";
    input.ignoreFocusOut = true;
    input.onDidAccept(() => {
      if (!input.value.trim()) {
        return;
      }

      resolve(input.value);
      input.hide();
    });
    input.onDidHide(() => {
      resolve();
    });

    input.show();
  });

const availableLanguages = [
  "de-DE",
  "en-US",
  "es-ES",
  "fr-FR",
  "it-IT",
  "ja-JP",
  "ko-KR",
  "nl-NL",
  "sv-SE",
  "zh-CN",
  "zh-TW",
];

const getLanguages = (): Promise<readonly string[] | void> =>
  new Promise((resolve) => {
    const picker = vscode.window.createQuickPick();
    picker.items = availableLanguages.map((label) => ({
      label,
    }));
    picker.canSelectMany = true;
    picker.ignoreFocusOut = true;
    picker.title = "Supported languages";
    picker.onDidAccept(() => {
      if (!picker.selectedItems.length) {
        return;
      }

      resolve(picker.selectedItems.map(({ label }) => label));
      picker.hide();
    });
    picker.onDidHide(() => {
      resolve();
    });

    picker.show();
  });

const getDefaultLanguage = (
  languages: readonly string[]
): Promise<string | void> =>
  new Promise((resolve) => {
    const picker = vscode.window.createQuickPick();
    picker.items = languages.map((label) => ({
      label,
    }));
    picker.ignoreFocusOut = true;
    picker.title = "Default language";
    picker.onDidAccept(() => {
      resolve(picker.selectedItems[0].label);
      picker.hide();
    });
    picker.onDidHide(() => {
      resolve();
    });

    picker.show();
  });

const oldTargets = {
  higgs: "Fitbit Ionic",
  meson: "Fitbit Versa",
  gemini: "Fitbit Versa Lite",
  mira: "Fitbit Versa 2",
};

const targets = {
  atlas: "Fitbit Versa 3",
  vulcan: "Fitbit Sense",
};

const getBuildTargets = (
  sdkVersion: string
): Promise<readonly string[] | void> =>
  new Promise((resolve) => {
    const picker = vscode.window.createQuickPick();
    picker.items = Object.entries(sdkVersion < "5." ? oldTargets : targets).map(
      ([label, description]) => ({
        label,
        description,
      })
    );
    picker.selectedItems = picker.items;
    picker.canSelectMany = true;
    picker.ignoreFocusOut = true;
    picker.title = "Build targets";
    picker.onDidAccept(() => {
      if (!picker.selectedItems.length) {
        return;
      }

      resolve(picker.selectedItems.map(({ label }) => label));
      picker.hide();
    });
    picker.onDidHide(() => {
      resolve();
    });

    picker.show();
  });

export const getPackage = async () => {
  const sdkVersion = await getSdkVersion();
  if (!sdkVersion) {
    return;
  }

  const appType = await getAppType();
  if (!appType) {
    return;
  }

  const appDisplayName = await getAppDisplayName();
  if (!appDisplayName) {
    return;
  }

  const languages = await getLanguages();
  if (!languages) {
    return;
  }

  const defaultLanguage =
    languages.length > 1 ? await getDefaultLanguage(languages) : languages[0];
  if (!defaultLanguage) {
    return;
  }

  const buildTargets = await getBuildTargets(sdkVersion);
  if (!buildTargets) {
    return;
  }

  return {
    name: appDisplayName
      .toLowerCase()
      .replace(/\s/g, "-")
      .replace(/[^-._a-z\d]/g, ""),
    version: "0.0.1",
    private: true,
    license: "UNLICENSED",
    scripts: {
      build: "fitbit-build",
      debug: "fitbit",
    },
    devDependencies: {
      "@fitbit/sdk": `~${sdkVersion}`,
      "@fitbit/sdk-cli": "^1.7.3",
    },
    fitbit: {
      appUUID: uuidv4(),
      appType: "app",
      appDisplayName,
      iconFile: "resources/icon.png",
      wipeColor: "#8bc34a",
      requestedPermissions: [],
      buildTargets,
      i18n: languages.reduce(
        (acc, language) => ({
          ...acc,
          [language]: {
            name: appDisplayName,
          },
        }),
        {}
      ),
      defaultLanguage,
    },
  };
};
