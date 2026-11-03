# Android bridge and Windows builds

## Scope

This checkout is `mirbehnam/turbo-scratch-gui-fa`, custom branch `my-develop`, based on
`54043ccbcfd795183af2b1dfd299b4e9ab09f6ff` (package version `3.2.37`).
It is independent of the adjacent `scratch-editor-fa` repository.

The existing Android host bridge contracts and offline media-library behavior
were adapted from that project. All customizations are documented in
[MY_DEVELOP_CHANGES.md](MY_DEVELOP_CHANGES.md). `develop` remains on the original
fork's commit and must not receive these changes.
The VM, compiler, branding inside the editor, addon functionality, and media
catalogs retain TurboWarp's behavior. The initial sprite is the Scratch cat,
the default language is Persian RTL, and only Arabic/English/Persian are enabled
through a standalone language dialog. See [docs/PERSIAN_CUSTOMIZATIONS.md](docs/PERSIAN_CUSTOMIZATIONS.md).
Persian media names/search, the compact procedure dialog, localized Windows exit
confirmation and server release/restore workflows are documented in
[docs/LIBRARY_DIALOG_RELEASE.md](docs/LIBRARY_DIALOG_RELEASE.md).
The internal tutorial
system and its dedicated source assets have been removed; see
[docs/TUTORIAL_REMOVAL.md](docs/TUTORIAL_REMOVAL.md) for the complete audited list.
No native Android client source or client assets were changed.

The complete sprite/costume/backdrop/sound catalog is bundled locally: 1304 files,
including the original content for TurboWarp-specific sprites. Library thumbnails,
rotating costume previews, sound previews, and actual media loads use local URLs.
Unbundled assets belonging to online projects/custom fonts and online services
(such as cloud, speech services, extension websites, and online projects) retain
their existing network behavior.

## Host contracts

`src/lib/android-bridge.js` manages the bridge. The host injects
`window.AndroidProjectSaver` and, for native text input,
`window.AndroidScratchTextInput` before loading the editor.

| Entry point | Contract |
| --- | --- |
| `window.AndroidScratchLoadProject()` | Open the existing project file picker. Android WebView's file chooser handles the selection. |
| `window.AndroidScratchLoadProjectUrl(url, filename)` | Fetch a host URL such as `https://appassets.androidplatform.net/projects/example.sb3`, preserve its filename, and load it through TurboWarp's existing upload/VM flow. Clear any previous browser File System Access handle. |
| `AndroidProjectSaver.projectLoaderReady()` | Optional notification when a project loader becomes available. Multiple TurboWarp uploader instances share one native entry point and notify once while registered. |
| `AndroidProjectSaver.projectLoadStarted()` | Optional notification before fetching a host project URL. |
| `beginSave(filename)`, `appendChunk(base64)`, `finishSave()` | Transfer an `.sb3` in ordered base64 chunks of at most 262144 characters. |
| `beginSpriteSave(filename, expectedBytes)`, `appendSpriteChunk(base64)`, `finishSpriteSave()` | Transfer a `.sprite3`; expectedBytes is the original Blob size. |

Native transfer resolves after calling `finishSave`/`finishSpriteSave`; this
existing interface has no asynchronous acknowledgement of the Android file write.
JavaScript exceptions reject the transfer and do not report a successful save.
Other file types, absent bridges, and incomplete saving interfaces retain the
existing browser download path.

File System Access open/save pickers are disabled when `AndroidProjectSaver` is
present, even with the host's Windows User-Agent. Desktop pickers keep their normal
behavior.

The native floating input remains in the Android client. No second input overlay
was added here. The existing client script updates DOM inputs and dispatches input
events. Numeric block fields use the standard text editor instead of opening a
second Scratch keypad when `AndroidScratchTextInput` exists. Desktop number fields
retain their existing behavior.

Naming dialogs paint before focusing the native input (two animation frames).
They fit the native overlay with `max-height: calc(100% - 16px)`, and background
clicks do not close them while the native bridge is present. Native confirmation
only updates/blurs the input: the user still presses the Scratch dialog's OK to
create a broadcast/variable/list. Browser-only dialogs keep their previous focus
and background-click behavior.

The editor configures its native Android viewport in the HTML head, before the
first layout: `width=1024, user-scalable=no`. Exact Android asset-origin detection
or either native bridge enables this even with a Windows User-Agent. The existing
host's wide-viewport/overview settings can scale the entire editor width. Normal
desktop/Electron and non-editor pages keep their upstream viewport. Vertical
scrolling and the editor's natural minimum height are unchanged.

## Build commands

Use Node.js 24 and install dependencies in this repository:

```powershell
$env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'
npm.cmd ci --include=dev --foreground-scripts --registry=https://registry.npmjs.org
npm.cmd run build:android
```

The Playwright flag skips an unnecessary test-browser download during dependency
installation. Git dependencies and the micro:bit firmware still need internet
access during installation. No proxy fallback is configured in the added build
scripts.

The committed `static/assets/` and `src/lib/libraries/offline-assets.json` are
ready for builds; media is not downloaded on each build. After a catalog update,
run `npm.cmd run assets:download` once to obtain missing/invalid files and refresh
the manifest. You may pass `-- --source-dir path/to/existing/assets` to reuse
verified files from another checkout. Both reused and downloaded files are
checked against their content-addressed MD5 names.

`npm run build:android`:

1. Runs TurboWarp's production build with relative chunk URLs and no source maps.
2. Makes `build/index.html` open the **editor**, matching the Android client's
   existing `assets/build/index.html` URL. `editor.html` also remains available.
3. Verifies the generated Android bridge contracts.
   It also verifies all offline media before and after compilation and rejects
   missing files or incorrect content hashes.
   Removed tutorial source files and tutorial image hashes are checked as well.
4. Packages that same `build/` into Windows x64 and ia32 Electron applications and
   compiles the two Inno Setup installers.

Copy the **contents** of `build/` into the desired Android client's assets/build
directory when ready. This task did not overwrite the current Android app assets.

For repackaging Windows without recompiling the editor:

```powershell
npm.cmd run build:windows
```

Windows packaging requires Windows and Inno Setup 6 or 7 (`ISCC_PATH` can override
the compiler location). It uses Electron `42.11.2`, cached under
`node_modules/.cache/scratch-electron/42.11.2`, or downloads it directly from
Electron's GitHub releases. Both architecture archives and rcedit were already
available locally for the initial build.

Outputs:

- Android/WebView files: `build/`
- Windows unpacked apps: `build-windows/win-x64-unpacked/` and
  `build-windows/win-ia32-unpacked/`
- Installers: `build-windows/installers/TurboWarp-FA-3.2.37-win-x64-Setup.exe`
  and `TurboWarp-FA-3.2.37-win-ia32-Setup.exe`

Versioned installer filenames follow this repository's root package version.
Windows uses its own `TurboWarp FA` application identity, installer AppId, and
installation directory, separate from Scratch farsi. It uses TurboWarp's icon.
A loopback server inside the Electron process serves the local editor files,
including bundled fonts which TurboWarp loads with fetch. This is a local asset
server and requires no external connection. Node integration is disabled in the
renderer and context isolation/sandboxing remain enabled.

## Validation

Initial validation completed on Windows:

- `npm run test:unit`: 64 tests passed, including bridge, offline media,
  tutorial removal, Android viewport, default cat/Persian and three-language bundle tests.
- Initial bridge/offline editor changes passed targeted ESLint without errors or warnings.
  For tutorial removal, the other changed files pass; `menu-bar.jsx` retains
  22 pre-existing lint errors. `i18n:src` is also blocked by the pre-existing
  duplicate `gui.menuBar.downloadToComputer` definitions; details are recorded
  in `MY_DEVELOP_CHANGES.md`.
- `npm run build:android`: production build and both Inno installers succeeded.
- Browser integration with the actual client text-input injection script and
  mocked native interfaces: native SB3 save, project URL reload exactly once,
  project filename preservation, Persian new-broadcast text, overlay-click
  protection, explicit dialog confirmation, numeric input, and regular desktop
  downloads all passed.
- Both packaged Electron architectures: editor, VM, Blocks and local assets load;
  native Android interface absent; closing the window exits the process.
- Offline library integration with all external requests blocked, both on
  localhost and the simulated Android asset origin: all 1304 media files
  accessible; shared and TurboWarp-specific sprites, costumes, backdrops, sound
  previews and sound selection work; SB3 save/reload works; no Scratch asset CDN
  requests or missing files.
- The complete web build has 1690 files (70.95 MiB), no source maps. SHA256 of
  every web file in both Windows packages matches the Android build.

The browser integration test simulates the native interface; it does not replace
testing on a physical Android WebView. No APK was built or installed in this task.
Installer compilation and unpacked-app execution were tested; installing into a
user profile was not performed.
