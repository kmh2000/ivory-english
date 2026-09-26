# Ivory English — progress
Updated: 2026-09-26

- Found: repository had the full 90-day catalog but no actual `dist/data/day-XX.json` files or MP3 bundles.
- Added: interim text-first days 1–10, with 340 bilingual sentences and 10 short readers.
- Preserved: ivory site layout, preference keys, last lesson and day completion storage.
- Changed: Pages workflow serves `dist/` directly; no MP3 restore, hash check, or voice QA gate.
- Added: text-only validator and sequential ten-day source import helper, which never alters previously released lessons.
- Next: enable GitHub Pages with source GitHub Actions if not already configured; verify deployment run. Import days 11–90 only from the user's actual complete source to preserve those originals.
