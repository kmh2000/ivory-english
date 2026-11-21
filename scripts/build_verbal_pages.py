#!/usr/bin/env python3
"""Build readable, faithful image pages for the verbal-only section.
The original numbered exercises sometimes have incomplete OCR text; rendering the
source pages preserves the exact wording, options and marked answers.
"""
from __future__ import annotations
from pathlib import Path
import hashlib
import io
import json
import os
import time
import urllib.request
import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "dist" / "verbal"
PAGES = OUTPUT / "pages"
PDF_URL = os.environ.get(
    "VERBAL_SOURCE_PDF",
    "https://eduschool40.blog/download-attachment/R4iFHWEeVdxb4-0XXZw-cA%2C%2C",
)
CHECKS = {
    247: "7a5fb47216c7", 251: "0870b3aab662",
    269: "e717ab3ec6d6", 279: "b5774192cd99",
    290: "4005063af6b2", 300: "33303eaf5e78",
    338: "894078caab1b",
}


def pdf_bytes():
    optional_local = ROOT / "verbal-source.pdf"
    if optional_local.exists():
        return optional_local.read_bytes()
    errors = []
    for attempt in range(3):
        try:
            request = urllib.request.Request(
                PDF_URL,
                headers={
                    "User-Agent": "Mozilla/5.0 (compatible; IvoryStudy/1.0)",
                    "Accept": "application/pdf,application/octet-stream,*/*",
                },
            )
            with urllib.request.urlopen(request, timeout=90) as response:
                data = response.read()
            if not data.startswith(b"%PDF"):
                raise ValueError("Source did not return a PDF")
            if len(data) < 1_000_000:
                raise ValueError("The original PDF is unexpectedly small")
            return data
        except Exception as exc:
            errors.append(str(exc))
            time.sleep(2 * (attempt + 1))
    raise RuntimeError("Could not download published source: " + "; ".join(errors))


def section(page):
    if page <= 268:
        return "تناظر لفظي"
    if page <= 278:
        return "خطأ سياقي"
    if page <= 289:
        return "إكمال الجمل"
    return "استيعاب المقروء"


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    PAGES.mkdir(parents=True, exist_ok=True)
    data = pdf_bytes()
    doc = fitz.open(stream=data, filetype="pdf")
    if len(doc) != 338:
        raise ValueError(f"Expected 338 source pages, got {len(doc)}")
    matches = []
    for page_number, expected in CHECKS.items():
        digest = hashlib.sha256(doc[page_number - 1].get_text().encode()).hexdigest()[:12]
        matches.append(digest == expected)
        print(f"PDF source verification page {page_number}: " + ("match" if digest == expected else f"DIFF ({digest})"))
    if not all(matches):
        for p in (247, 269, 279, 290, 338):
            print("REMOTE-PREVIEW", p, repr(doc[p - 1].get_text()[:450]), flush=True)
        raise ValueError("Public PDF does not match the specific uploaded source; refusing to substitute different questions")
    manifest = []
    for page_number in range(247, 339):
        p = doc[page_number - 1]
        pix = p.get_pixmap(matrix=fitz.Matrix(1.67, 1.67), alpha=False)
        img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        destination = PAGES / f"page-{page_number}.webp"
        img.save(destination, "WEBP", quality=82, method=5)
        manifest.append({
            "page": page_number,
            "section": section(page_number),
            "image": f"pages/page-{page_number}.webp",
            "width": img.width,
            "height": img.height,
        })
    (OUTPUT / "reader-manifest.json").write_text(
        json.dumps({
            "total": len(manifest),
            "sections": ["تناظر لفظي", "خطأ سياقي", "إكمال الجمل", "استيعاب المقروء"],
            "source_sha256": hashlib.sha256(data).hexdigest(),
            "pages": manifest,
        }, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Rendered {len(manifest)} full source pages, {sum(x.stat().st_size for x in PAGES.glob('*.webp')) // 1024} KiB")


if __name__ == "__main__":
    main()
