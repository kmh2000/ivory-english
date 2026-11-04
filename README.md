# Ivory English — 30-day bilingual learning release

This text-first edition includes **days 1–30** (1,020 English/Arabic sentences, 34 per day) and short English readers for each day. Days 11–30 were newly authored for this release, not imported from the missing original 90-day source. These are **not the previously planned 20-minute audio stories**. Audio uses the device/browser English speech voice where supported; no MP3 files are bundled.

The site now features a persistent **dark/light appearance switch**, starting in dark mode for new visitors. It saves under `ivory.theme.v1`. Existing lesson progress and listening preferences remain under `ivory.progress.v1` and `ivory.preferences.v1`.

GitHub Actions deploys `dist/` when pushing to `main`; the workflow checks published lesson JSON files using `python scripts/check_text.py`.

The original complete 90-day source ZIP and full-length MP3 files are not present in this repository. Days 31–90 remain unpublished.

## American and British accent playback

Daily lessons and stories now offer one-tap **🇺🇸 American (en-US)** or **🇬🇧 British (en-GB)** selection, voice auto-ranking, manual selection among the device's matching voices, and an accent sample. Accent choice is saved in `ivory.preferences.v1` without resetting learning progress. The page requests a matching voice; if one isn't installed, the browser may fall back to its default. The naturalness of these built-in voices varies by device.

**Important:** No GPT conversational voices or pre-rendered neural MP3s are embedded yet. True neural speech requires securely generated/hosted recordings or a server-side TTS API. Never put a paid API key inside the public `dist/` client code.
