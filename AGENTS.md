# Agent guide for this TurboWarp fork

The File menu packager is an embedded HTML-only tool, not an external website.
Read [docs/EMBEDDED_PACKAGER.md](docs/EMBEDDED_PACKAGER.md) before changing its
iframe protocol, pinned vendor sources, local scaffolding or native export bridges.
Preserve automatic current-project import, fa/ar/en, no intro/project chooser,
Android HTML saves in the private My Projects library, browser/Windows Downloads saves, native sharing and the main-frame/origin restrictions. Every build
must include `build/packager`; `build:android` also packages it in both Windows builds.
Quality presets default to Medium and Advanced settings stay collapsed. Successful
generation shows a cancellable loading screen for at least five seconds total.
Direct play uses a sandboxed iframe in browser/Electron and the Android client's
separate bridge-free PackagedHtmlPlayer within ScratchScreen. Never run packaged HTML in an Android
WebView that has the editor's JavaScript interfaces. Android saved-project commands can arrive during startup. Queue them until a
SHOWING project state before fetching/dispatching an upload. Keep the native entry
point available during startup so the host's bounded polling cannot lose a command.

Before changing Android input/loading/saving or build/desktop packaging, read
[ANDROID_BRIDGE.md](ANDROID_BRIDGE.md) and [MY_DEVELOP_CHANGES.md](MY_DEVELOP_CHANGES.md).
Preserve the host method names and the
existing Android client's assets/build/index.html entry point.

This repository is separate from the adjacent scratch-editor-fa checkout. Do not
modify that repository as part of work here. Keep all customizations on
`my-develop`; `develop` must stay identical to the original fork's `origin/develop`.
Android bridge compatibility, Android/Windows packaging, and offline media
libraries and complete removal of internal tutorials were requested for this fork.
Do not silently port other customizations
or change VM implementations.

The initial sprite is the Scratch cat (two costumes and Meow), not Dango. Fresh
installs default to Persian RTL; preserve an explicit supported user choice.
Only `ar`, `en`, `fa` are interface languages. Keep the standalone language button
and three-language dialog outside Settings, and do not restore the Feedback button.
Read `docs/PERSIAN_CUSTOMIZATIONS.md` for the locale loaders and source pruning.
Keep the bundled BYekan font on editor controls, block text and the TurboWarp
toolbox's `.scratchCategoryMenuItemLabel`. Do not change fonts inside user costumes.
The See Project Page component, its CSS, handler and enableCommunity wiring are
removed. Preserve player/fullscreen, Share's ProjectWatcher/onSeeCommunity and
the icon shared with See Inside. The Addons toolbar button is temporarily gated
by SHOW_ADDONS_BUTTON; keep addon source, runtime and settings intact. The username
and cloud-variable menu entries are removed; their underlying features remain.
Advanced dialog translations live in src/lib/tw-translations/custom-settings.json.
That dictionary also covers all theme menu labels and submenu choices. The default
accent is blue; preserve explicit saved theme choices. See docs/NOT_YET_PORTED.md
before porting additional customizations from the adjacent Scratch repository.
After updating generated addon/TurboWarp translations, run `npm run locales:prune`.
Addon defaults in addons.js override Find Bar to disabled and Hide Flyout to
enabled. Preserve these in regenerated manifests/entries; explicit saved user
choices still take precedence over defaults.
Do not modify installed dependencies to enforce language restrictions.

All sprite/costume/backdrop/sound library assets and thumbnails must use the local
`static/assets` files. Do not restore CDN URLs for bundled media or introduce
per-thumbnail Blob conversion. Preserve the original library names and content.
After changing catalogs, run `npm run assets:download`, commit the updated
`src/lib/libraries/offline-assets.json` and required `static/assets` files, then
run `npm run build:verify-offline`. The verifier checks completeness and original
MD5 content hashes. Keep unrelated online services and unbundled project/custom
font fallbacks distinct from the offline media-library guarantee.
Persian names and bilingual media search use src/lib/libraries/translations/fa.js,
translate-library-name.js and library-item-search.js. Keep catalog keys, favorites,
asset URLs and names in existing projects unchanged; localize only library display
and newly selected built-in media. Include TurboWarp-specific sprites in coverage.

The Make a Block dialog is compact, scrolls inside its own bounded overlay and
does not focus a text input on opening. Do not replace its percentage height bound
with vh units in the Android host. Windows closes through window-config.cjs's
localized confirmation; Cancel must preserve the running window.

General CI is manual on my-develop. Explicit exceptions are custom-release.yml
(server builds Android assets and both Windows installers on root version upgrades
or custom vX.Y.Z-fa.N tags) and restore-point.yml (every push to my-develop creates
a commit-specific source prerelease/tag through GitHub APIs on the runner).
Never create restore tags/archives locally, move existing restore tags, promote
snapshots to Latest, or publish npm packages. Keep develop identical to origin/develop.
Read docs/LIBRARY_DIALOG_RELEASE.md for these contracts and verification.

Internal tutorials are intentionally removed from source and every GUI build.
Read [docs/TUTORIAL_REMOVAL.md](docs/TUTORIAL_REMOVAL.md) before an upstream merge.
Do not restore cards, decks, tips-library state/actions or tutorial URL handling.
The 1500 audited deletions and original SHA256 hashes are recorded in
`scripts/tutorial-removal-audit.json`; `build:verify-offline` also verifies source
removal and rejects removed images in the build. Preserve shared UI assets,
addons, extension help, and all media libraries.

Use Node.js 24 and the committed package-lock.json. Run `npm run test:unit` and
lint affected source files. `npm run build:android` builds the editor and both
Windows installers; `npm run build:windows` only repackages the existing build.
Keep Windows app/installer identities separate from Scratch farsi.

The editor HTML configures `width=1024, user-scalable=no` before its first layout
only for the exact Android asset origin or a native Android bridge. Preserve the
ordinary desktop/Electron viewport and do not rely on the host's Windows UA to
detect Android. Keep this initialization before the editor bundles load.

All packager presets disable stop, pause and fullscreen controls inside the HTML.
Preset selection and Advanced checkboxes use the same options store. The Android
HTML player keeps the existing left rail visible, including during custom HTML
fullscreen. Hide Home and WindowsScrollBar while playing; show localized Refresh
and Close icons there instead. Restore Home/scrollbar on closing without recreating
the editor WebView. Floating keyboard events must target the player while active.

The toolbar quality-run button automatically packages a high-quality snapshot
without the manual packager five-second minimum delay. It shares the export bridge
and releases its builder/player on completion/close. Preserve editor VM identity.
Restore/FPS/Advanced messages live in `src/lib/tw-translations/editor-extras.json`.
Visible app explanations use localized Scratch Farsi branding; preserve upstream
URLs, attribution and technical identifiers. The first toolbar item is the inert
Persian image documented in `docs/TOOLBAR_BRANDING.md`, without a Home link.

## Auto Builder integration

The sibling `../auto-builder/README.md` describes the local Windows build tool.
When changing Android/Windows build commands, outputs, prerequisites or asset
contracts, update Auto Builder and its safety checks and documentation as well.
The Android host owns shared-media deduplication; do not deduplicate its raw inputs.

Desktop HTML playback must create its Blob URL inside the opaque-origin data
bootstrap in `src/lib/isolated-player.js`. The player needs its nested SVG
sandbox to be same-origin with the player, while remaining cross-origin from
the editor and its bridges. Preserve this boundary on changes to playback.

The duplicate Advanced toolbar item and Block Colors link to addon customization
are intentionally absent. Advanced Settings remains in Edit; preserve addon code.
Desktop file save messages `tw.saveTo`, `tw.saveAs`, `tw.oldDownload` have fa/ar
translations in editor-extras.json, including the `{file}` placeholder.

GUI and block colors default to Theme.light regardless of OS theme/contrast;
explicit user theme choices must persist. See docs/NETWORK_AUDIT.md for current
offline assets, conditional network access, and the scope of observed behavior.
