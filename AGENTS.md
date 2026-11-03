# Agent guide for this TurboWarp fork

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
