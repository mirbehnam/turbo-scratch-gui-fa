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

All sprite/costume/backdrop/sound library assets and thumbnails must use the local
`static/assets` files. Do not restore CDN URLs for bundled media or introduce
per-thumbnail Blob conversion. Preserve the original library names and content.
After changing catalogs, run `npm run assets:download`, commit the updated
`src/lib/libraries/offline-assets.json` and required `static/assets` files, then
run `npm run build:verify-offline`. The verifier checks completeness and original
MD5 content hashes. Keep unrelated online services and unbundled project/custom
font fallbacks distinct from the offline media-library guarantee.

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
