"""Restore original audio bytes and validate the published site before deployment."""
import argparse
import hashlib
import json
import shutil
import tarfile
import tempfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]

def safe_path(name):
    path = PurePosixPath(name)
    if path.is_absolute() or '..' in path.parts:
        raise ValueError(f'Unsafe archive path: {name}')
    return path

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.exists():
        parser.error('Output directory must not already exist')
    manifest = json.loads((ROOT / 'release.json').read_text())
    with tempfile.TemporaryDirectory() as temporary:
        temp = Path(temporary)
        site = temp / 'site'
        shutil.copytree(ROOT / 'dist', site, ignore=shutil.ignore_patterns('audio'))
        restored = set()
        for number, bundle in enumerate(manifest['audioBundles']):
            archive = temp / f'bundle-{number}.tar.gz'
            with archive.open('wb') as combined:
                for part in bundle['parts']:
                    data = (ROOT / safe_path(part['path'])).read_bytes()
                    assert len(data) == part['size']
                    assert hashlib.sha256(data).hexdigest() == part['sha256']
                    combined.write(data)
            assert archive.stat().st_size == bundle['archive']['size']
            assert hashlib.sha256(archive.read_bytes()).hexdigest() == bundle['archive']['sha256']
            expected = bundle['files']
            bundle_restored = set()
            with tarfile.open(archive, 'r|gz') as tar:
                for member in tar:
                    path = safe_path(member.name)
                    assert member.isfile() and str(path).startswith('audio/')
                    assert member.name in expected and member.name not in restored
                    data = tar.extractfile(member).read()
                    assert hashlib.sha256(data).hexdigest() == expected[member.name]
                    target = site / path
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(data)
                    restored.add(member.name)
                    bundle_restored.add(member.name)
            assert bundle_restored == set(expected)
        assert len(restored) == manifest['audioFiles']
        count = manifest['publishedDays']
        assert len(list((site / 'data').glob('day-*.json'))) == count
        index = json.loads((site / 'data/index.json').read_text())
        assert index['publishedDays'] == count
        assert [day['day'] for day in index['days'] if day['available']] == list(range(1, count + 1))
        for number in range(1, count + 1):
            day = json.loads((site / f'data/day-{number:02d}.json').read_text())
            assert len(day['sentences']) == len(day['audio']['sentences']['clips']) == 34
            clips = day['audio']['sentences']['clips'] + [day['audio']['story']]
            for clip in clips:
                assert (site / safe_path(clip['url'].lstrip('/'))).is_file()
        (site / '.nojekyll').touch()
        shutil.copytree(site, output)
    print(f'Verified {count} days and {len(restored)} original MP3 recordings.')

if __name__ == '__main__':
    main()
