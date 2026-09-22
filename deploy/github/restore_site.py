"""Restore the verified, existing website bytes for GitHub Pages. No audio generation."""
from pathlib import Path, PurePosixPath
import argparse
import hashlib
import json
import os
import shutil
import tarfile
import tempfile


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--manifest', default='release.json')
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    manifest_path = Path(args.manifest).resolve()
    manifest = json.loads(manifest_path.read_text())
    root = manifest_path.parent
    output = Path(args.output).resolve()
    if output.exists():
        raise SystemExit('Output must be a new directory')
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='ivory-restore-', dir=output.parent) as temporary:
        temp = Path(temporary)
        archive = temp / 'site.tar.gz'
        archive_hash = hashlib.sha256()
        with archive.open('wb') as combined:
            for part in manifest['parts']:
                part_path = PurePosixPath(part['path'])
                assert not part_path.is_absolute() and '..' not in part_path.parts
                source = root / part_path
                assert source.stat().st_size == part['size'], source
                part_hash = hashlib.sha256()
                with source.open('rb') as incoming:
                    for block in iter(lambda: incoming.read(1024 * 1024), b''):
                        combined.write(block)
                        part_hash.update(block)
                        archive_hash.update(block)
                assert part_hash.hexdigest() == part['sha256'], source
        assert archive.stat().st_size == manifest['archive']['size']
        assert archive_hash.hexdigest() == manifest['archive']['sha256']
        staged = temp / 'site'
        staged.mkdir()
        expected = manifest['files']
        restored = set()
        with tarfile.open(archive, 'r|gz') as bundle:
            for member in bundle:
                if member.name not in expected:
                    continue
                assert member.isfile(), member.name
                assert member.name.startswith('dist/'), member.name
                relative = PurePosixPath(member.name).relative_to('dist')
                assert not relative.is_absolute() and '..' not in relative.parts
                assert member.name not in restored
                destination = staged / relative
                destination.parent.mkdir(parents=True, exist_ok=True)
                with bundle.extractfile(member) as incoming, destination.open('wb') as outgoing:
                    digest = hashlib.sha256()
                    for block in iter(lambda: incoming.read(1024 * 1024), b''):
                        outgoing.write(block)
                        digest.update(block)
                assert digest.hexdigest() == expected[member.name], member.name
                restored.add(member.name)
        assert restored == set(expected), 'Incomplete website archive'
        assert (staged / 'index.html').is_file()
        assert len(list((staged / 'audio').rglob('*.mp3'))) == 3154
        assert len(list((staged / 'data').glob('day-*.json'))) == 90
        os.replace(staged, output)
    print(f'Restored {len(restored)} verified files, including all 3154 MP3 recordings.')


if __name__ == '__main__':
    main()
