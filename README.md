# Default Tab Selector for Power Apps Maker Portal

A Chrome and Edge extension that lets you customise the default tab which Power Apps maker portal pages open on.

The Tables page opens on the *Recommended* tab by default. Use this extension to customise the default tab to *All* instead, and set customised default tabs for 11 other maker portal pages.

## Usage

Requires Google Chrome or Microsoft Edge 111 or later.

1. Select the extension's icon in the browser toolbar or extension menu to open the popup.
2. Choose a section, then select the tab each page should open on by default. If the active browser tab is a supported maker portal page, the popup opens on that page's section with the page highlighted.
3. Open the page in the maker portal. The extension selects your chosen tab automatically.

To restore a page's original behaviour, select its portal default, the first option for each page. **Reset all** restores every page at once.

Pages set to their portal default, and unsupported pages, are left untouched by the extension. If your chosen tab can no longer be found (e.g. a portal update changes a page's tabs), the page opens on its own default.

The popup follows your browser's light or dark setting and is keyboard accessible.

## Supported pages

| Section | Pages |
|---|---|
| General | Home, Plans, Apps, Solutions, Websites |
| Data | Tables, Columns, Link data |
| AI | AI hub, Agents, Prompts, AI models |

Only the commercial portal at `make.powerapps.com` is supported.

## Troubleshooting

- **The popup doesn't highlight the page I'm on, or nothing switches.** Refresh the maker portal tab. The extension doesn't run in tabs that were open before it was installed or updated.
- **My choices didn't appear on another computer.** They sync through your browser account, so check that sync is turned on, and that you're using the same browser (Chrome to Chrome, Edge to Edge).
- **A page stopped switching.** Microsoft has probably changed its tabs. See [Contributing](#contributing).

## Privacy

The extension collects no personal data, makes no network requests and runs only on `make.powerapps.com`. Choices are stored in the browser's sync storage. See [PRIVACY.md](PRIVACY.md) for details.

## Project structure

```
├── icons/                        Extension icons (16, 32, 48, 96 and 128 px)
├── src/
│   ├── content/
│   │   ├── content-script.ts     Finds the open page's tab and selects your choice
│   │   └── main-world-bridge.ts  Reports in-portal navigation to the content script
│   ├── popup/
│   │   ├── components/           Section tabs and page rows
│   │   ├── hooks/                Stored preferences and the active tab's page
│   │   ├── Popup.tsx             The toolbar popup (React)
│   │   ├── main.tsx              Popup entry point
│   │   ├── popup.html
│   │   └── styles.css
│   ├── shared/
│   │   ├── config/
│   │   │   └── categories.ts     Every supported page and its tabs
│   │   ├── domTargeting.ts       Finds a page's tab by its label
│   │   ├── messages.ts           Popup ↔ content script message types
│   │   ├── preferenceUtils.ts    Default and customised checks for a page
│   │   ├── storage.ts            Reads and writes preferences
│   │   ├── types.ts
│   │   └── urlMatcher.ts         Matches the page's URL to a supported page
│   └── vite-env.d.ts
├── manifest.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── LICENSE
├── PRIVACY.md
└── README.md
```

## Building from source

1. Install [Node.js](https://nodejs.org/) 20.19 or later, then clone this repository.
2. Run `npm install`, then `npm run build`. This creates a `dist` folder.
3. Open `chrome://extensions` (or `edge://extensions`), turn on **Developer mode**, choose **Load unpacked** and select the `dist` folder.
4. Refresh any maker portal tabs that were already open, so the extension can run in them.

## Add or modify pages

Pages are defined solely in `src/shared/config/categories.ts`. Add an entry using the format below:

```ts
{
  id: 'data-new-thing',                     // storage key: should not change after release
  section: 'data',                          // the popup section the page will appear in
  name: 'New thing',                        // the page name shown in the popup under Page
  uiVersion: 'v8',                          // the Fluent UI generation the page's tabs use (v8/v9)
  urlPattern: '/new-thing',                 // path segments to match; '*' matches exactly one segment
  options: [                                // options[0] must be the page's own default
    { id: 'my-items', label: 'My items' },  // id (storage key): should not change after release
    { id: 'all', label: 'All' },            // label: must match the tab's visible text or aria-label
  ],
},
```

Check a page's `uiVersion` by inspecting its tabs with developer tools. `v8` tabs are `[role="tab"]` elements marked with `aria-selected`. `v9` tabs are buttons marked with `aria-pressed`.

## Contributing

If a page stops switching, Microsoft has probably changed its tabs. Please [open an issue](https://github.com/KalemAkhtar/Default-Tab-Selector/issues) with the page's URL path and the tab names you see.

## Licence

MIT. See [LICENSE](LICENSE).

The extension is an independent, open-source project and is not affiliated with Microsoft. Power Apps is a trademark of Microsoft Corporation, referenced only to describe compatibility.