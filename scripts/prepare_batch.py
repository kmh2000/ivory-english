"""Add an existing 10-day audio batch without regenerating or recompressing MP3s."""
import argparse
import gzip
import hashlib
import json
import shutil
import tarfile
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', required=True, type=Path, help='Existing complete dist directory')
    parser.add_argument('--through', required=True, type=int)
    args = parser.parse_args()
    if args.through < 10 or args.through > 90 or args.through % 10:
        parser.error('--through must be 10, 20, ... 90')
    source = args.source.resolve()
    release_file = ROOT / 'release.json'
    release = json.loads(release_file.read_text()) if release_file.exists() else {'version': 1, 'publishedDays': 0, 'audioBundles': []}
    previous = release['publishedDays']
    if args.through != previous + 10:
        parser.error(f'Next batch must finish at day {previous + 10}')
    files = [f for n in range(previous + 1, args.through + 1) for f in sorted((source / f'audio/day-{n:02d}').glob('*.mp3'))]
    if previous == 0:
        files += sorted((source / 'audio/bonus').glob('*.mp3'))
    assert len(files) == 350 + (4 if previous == 0 else 0), 'Missing recordings'
    for n in range(previous + 1, args.through + 1):
        day = json.loads((source / f'data/day-{n:02d}.json').read_text())
        assert len(day['sentences']) == len(day['audio']['sentences']['clips']) == 34
        assert day['audio']['story']['words'], 'Missing word timing'
        assert abs(day['audio']['story']['duration'] - 1200) < 1
        destination = ROOT / f'dist/data/day-{n:02d}.json'
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source / f'data/day-{n:02d}.json', destination)
    stem = f'audio-{previous + 1:02d}-{args.through:02d}'
    pack_dir = ROOT / 'releases' / stem
    pack_dir.mkdir(parents=True, exist_ok=True)
    bundle = {'firstDay': previous + 1, 'lastDay': args.through, 'parts': [], 'files': {str(f.relative_to(source)): digest(f) for f in files}}
    with tempfile.TemporaryDirectory() as temporary:
        archive = Path(temporary) / 'audio.tar.gz'
        with archive.open('wb') as raw, gzip.GzipFile(filename='', mode='wb', fileobj=raw, mtime=0, compresslevel=6) as compressed, tarfile.open(fileobj=compressed, mode='w') as tar:
            for f in files:
                info = tar.gettarinfo(str(f), arcname=str(f.relative_to(source)))
                info.uid = info.gid = 0
                info.uname = info.gname = ''
                info.mtime = 0
                with f.open('rb') as incoming:
                    tar.addfile(info, incoming)
        bundle['archive'] = {'size': archive.stat().st_size, 'sha256': digest(archive)}
        with archive.open('rb') as incoming:
            part_number = 0
            while data := incoming.read(2 * 1024 * 1024):
                name = pack_dir / f'part-{part_number:03d}.bin'
                name.write_bytes(data)
                bundle['parts'].append({'path': str(name.relative_to(ROOT)), 'size': len(data), 'sha256': digest(name)})
                part_number += 1
    release['audioBundles'].append(bundle)
    release['publishedDays'] = args.through
    release['audioFiles'] = args.through * 35 + 4
    index = json.loads((source / 'data/index.json').read_text())
    index.update(version=2, publishedDays=args.through, totalDays=90, release=f'batch-{args.through // 10}')
    index['days'] = [dict(day, available=day['day'] <= args.through) for day in index['days']]
    (ROOT / 'dist/data/index.json').write_text(json.dumps(index, ensure_ascii=False, separators=(',', ':')) + '\n')
    release_file.write_text(json.dumps(release, indent=2) + '\n')
    print(json.dumps({'publishedDays': args.through, 'newRecordings': len(files), 'newParts': len(bundle['parts']), 'packedBytes': bundle['archive']['size']}))

if __name__ == '__main__':
    main()
