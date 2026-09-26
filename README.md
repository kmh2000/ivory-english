# Ivory English — gradual text releases

An ivory-themed 90-day bilingual English course. This repository now contains a usable **text-first release for days 1–10**: 340 English/Arabic sentences, 10 short contextual readers, and 4 bonus expressions. The original 90-day complete ZIP (including its 20-minute stories and MP3s) is **not present in this repository**. These ten short lessons are a functional interim text edition and are not represented as the original full-length stories.

The browser's English speech synthesis is available for sentence and reader playback where supported. Recorded MP3 assets are intentionally not required to deploy. Preferences and completed/listened days remain in localStorage under the existing `ivory.*.v1` keys. Deploying additional batches at the same URL will not reset that progress.

## Publish

In repository Settings → Pages → Build and deployment, choose **GitHub Actions**. The workflow `Publish Ivory English` validates the published JSON and deploys `dist/` directly on pushes to main or manual dispatch. Do not claim the public URL is live until the deployment run completes successfully.

## Release the existing original material in ten-day batches

Keep the original complete ZIP/source outside the repository. From the extracted original `dist` directory, run:

```bash
python scripts/prepare_text_batch.py --source /path/to/original/dist --through 20
python scripts/check_text.py
git add dist/data release.json
git commit -m "Publish text days 11-20"
git push
```

Repeat `--through 30`, `40`, …, `90`. The importer copies only the ten new days, strips links to unpublished audio, and retains every previously published day unchanged. Full original MP3s can be added separately later with matching media references. The first ten days here are a usable replacement edition because their original source files were not found in this repository.
