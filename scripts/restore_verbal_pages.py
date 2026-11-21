#!/usr/bin/env python3
"""Reuse the previously verified, deployed verbal page artwork.

Extracts only whitelisted WebP pages and the JSON manifest from an official
previous GitHub Pages artifact. Prevents restoring stale application code.
"""
from pathlib import Path
import json
import re
import sys
import tarfile

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "dist" / "verbal"
PAGES = TARGET / "pages"
EXPECTED = set(range(247, 339))

def main():
    archive = Path(sys.argv[1])
    if not archive.exists():
        raise SystemExit("Missing prior pages artifact: " + str(archive))
    PAGES.mkdir(parents=True, exist_ok=True)
    found = set()
    manifest = None
    with tarfile.open(archive, "r:*") as tar:
        for entry in tar.getmembers():
            if not entry.isfile():
                continue
            name = entry.name.lstrip("./")
            m = re.fullmatch(r"verbal/pages/page-(\d+)\.webp", name)
            if m:
                number = int(m.group(1))
                if number not in EXPECTED:
                    continue
                data = tar.extractfile(entry).read()
                if not data.startswith(b"RIFF") or b"WEBP" not in data[:16]:
                    raise ValueError("Invalid WebP page " + str(number))
                (PAGES / ("page-" + str(number) + ".webp")).write_bytes(data)
                found.add(number)
            elif name == "verbal/reader-manifest.json":
                manifest = tar.extractfile(entry).read()
    if found != EXPECTED:
        raise ValueError("Missing pages: " + str(sorted(EXPECTED-found)))
    if manifest is None:
        raise ValueError("Missing verified page manifest")
    manifest_json = json.loads(manifest)
    if len(manifest_json.get("pages", [])) != 92:
        raise ValueError("Unexpected page count in source manifest")
    (TARGET / "reader-manifest.json").write_bytes(manifest)
    print("Restored 92 verified original verbal page images.")

if __name__ == "__main__":
    main()
