"""Check all published bilingual content without requiring MP3 files."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
index = json.loads((DIST / "data/index.json").read_text(encoding="utf-8"))
available = [d["day"] for d in index["days"] if d.get("available", False)]
expected = list(range(1, index["publishedDays"] + 1))
assert len(index["days"]) == 90 and available == expected, "Release days must be contiguous"
assert index["publishedDays"] % 10 == 0 and 10 <= index["publishedDays"] <= 90
assert (DIST / "index.html").is_file() and (DIST / "app.js").is_file()
assert (DIST / "styles.css").is_file()
total = 0
for number in expected:
    file = DIST / f"data/day-{number:02d}.json"
    day = json.loads(file.read_text(encoding="utf-8"))
    assert day["day"] == number
    assert len(day["sentences"]) == 34, f"Day {number}: expected 34 sentences"
    assert all(s.get("en") and s.get("ar") for s in day["sentences"])
    story = day["story"]
    assert story.get("sections") and all(x.get("paragraphs") for x in story["sections"])
    paragraphs = "\n\n".join(p for section in story["sections"] for p in section["paragraphs"])
    for sentence in day["sentences"]:
        assert sentence["en"] in paragraphs, f"Day {number} story missing a sentence"
    if day.get("audio"):
        for clip in day["audio"].get("sentences", {}).get("clips", []):
            if clip.get("url"):
                assert (DIST / clip["url"].lstrip("/")).is_file(), f"Day {number}: broken audio"
        if day["audio"].get("story", {}).get("url"):
            assert (DIST / day["audio"]["story"]["url"].lstrip("/")).is_file()
    total += 34
assert "bonusAudio" not in index or all((DIST / x["url"].lstrip("/")).is_file() for x in index["bonusAudio"].get("clips", []))
print(f"PASS: {len(expected)} published lessons, {total} bilingual sentences, stories present; no MP3 QA required.")
