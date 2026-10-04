# Privacy Policy

**Default Tab Selector for Power Apps Maker Portal**

Last updated: 5 October 2026

## Summary

- The extension does not collect, transmit, sell or share any personal data.
- It makes no network requests of its own, and has no accounts, analytics, advertising or tracking.
- It stores only a choice of default tab for each supported page on `https://make.powerapps.com`.

## Data storage

The extension stores one setting: a list of the customised maker portal pages, and the tab chosen for each. 
For example, `{ "data-tables": "all" }`. Pages left on their portal default are not stored.
This setting contains no personal information. It is never sent to the developer, and is shared only with the browser's own sync, described below.

Settings are saved with the browser's `chrome.storage.sync` API. If browser sync is enabled, settings will sync to other devices signed in to the same browser account. 
This sync is provided by the browser vendor (Google or Microsoft). If sync is turned off, settings will stay on the device where they are made.

To delete settings, open the popup and select **Reset all**. This removes them from the browser and from any other browsers synced to the same account.

## Page access

The extension runs only on `https://make.powerapps.com`. On those pages it reads:

- the page's address, to determine which supported page is open
- the labels and selected state of the page's tab buttons, to find and select a customised default
- user clicks on those tab buttons, to stop the override behaviour if a user selects a tab themself

This happens entirely within the browser. The extension does not read, store or transmit any other page content.

## Permissions

| Permission | Why it is needed |
|---|---|
| `storage` | Saves chosen default tabs for each page. |
| Access to `make.powerapps.com` | Lets the extension detect which maker portal page is open and select chosen tabs. The browser describes this as being able to "read and change your data on make.powerapps.com". The extension runs on no other website. |

## Third-party services

The extension uses no third-party services, libraries that collect data, or remote code. All of its code is packaged with the extension.

## Contact

For questions about this policy, please [open an issue](https://github.com/KalemAkhtar/Default-Tab-Selector/issues) on GitHub.
