const stringify = (content: any) => JSON.stringify(content, null, "\t");

const isSdk4 = (pkg: any) =>
  pkg.devDependencies["@fitbit/sdk"].replace(/[^.\d]/g, "").startsWith("4");

const styles = {
  "styles.css": `#background {
    width: 100%;
    height: 100%;
    fill: white;
}`,
};

interface Project {
  pkg: any;
}

export const getContents = ({ pkg }: Project) => ({
  ".gitignore": `node_modules
build`,
  "package.json": stringify(pkg),
  "tsconfig.json": stringify({
    extends: "./node_modules/@fitbit/sdk/sdk-tsconfig.json",
  }),

  app: {
    "index.ts": "console.log('Hello, world')",
  },

  companion: {
    "index.ts": `import { settingsStorage } from 'settings';

settingsStorage.setItem('myProp', 'Hello, world');
console.log('Hello, world')`,
  },

  settings: {
    "index.tsx": `registerSettingsPage(({ settings: { myProp } }) => (
    <Page>
        <Section title="Settings">{myProp && <Text>{myProp}</Text>}</Section>
    </Page>
));`,
  },

  resources: {
    ...styles,
    ...(isSdk4(pkg)
      ? {
          "index.gui": `<svg>
    <rect id="background" />
</svg>`,
          "widgets.gui": `<svg>
    <defs>
        <link rel="stylesheet" href="styles.css" />
        <link rel="import" href="/mnt/sysassets/widgets_common.gui" />
    </defs>
</svg>`,
        }
      : {
          "index.view": `<svg>
    <rect id="background" />
</svg>`,
          "widget.defs": `<svg>
    <defs>
        <link rel="stylesheet" href="styles.css" />
        <link rel="import" href="/mnt/sysassets/system_widget.defs" />
    </defs>
</svg>`,
        }),
  },
});
