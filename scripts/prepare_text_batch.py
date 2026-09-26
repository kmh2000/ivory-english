"""Import original text-only lessons in ten-day batches, leaving older days untouched.
Usage: python scripts/prepare_text_batch.py --source /path/to/original/dist --through 20
"""
import argparse
import json
import shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser()
p.add_argument('--source', required=True, type=Path)
p.add_argument('--through', required=True, type=int)
args=p.parse_args()
dest=ROOT/'dist'/'data'
index_path=dest/'index.json'
index=json.loads(index_path.read_text(encoding='utf-8'))
old=index['publishedDays']
if args.through != old+10 or args.through>90:
    p.error(f'Expected next batch ending on {old+10}; source originals are never rewritten.')
source=args.source.resolve()
new_files=[]
for n in range(old+1,args.through+1):
    src=source/'data'/f'day-{n:02d}.json'
    data=json.loads(src.read_text(encoding='utf-8'))
    assert data['day']==n and len(data['sentences'])==34
    assert all(s.get('en') and s.get('ar') for s in data['sentences'])
    assert data['story']['sections']
    data.pop('audio',None)  # originals are untouched; device speech is the interim playback
    target=dest/f'day-{n:02d}.json'
    if target.exists(): raise FileExistsError(target)
    new_files.append((target,data))
for target,data in new_files:
    target.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for d in index['days']:
    d['available']=d['day']<=args.through
    if old < d['day'] <= args.through:
        data=next(data for target,data in new_files if data['day']==d['day'])
        story_text=' '.join(p for section in data['story']['sections'] for p in section['paragraphs'])
        d['title']=data['title'];d['titleAr']=data.get('titleAr',d['titleAr'])
        d['storyWords']=len(story_text.split())
        d['estimatedSeconds']=data['story'].get('estimatedSeconds',round(d['storyWords']/2.5))
        d.pop('audioDuration',None)
index['publishedDays']=args.through
index['release']=f'text-batch-{args.through//10}'
index_path.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'release.json').write_text(json.dumps({'publishedDays':args.through,'mode':'text-only','release':index['release']},indent=2)+'\n')
print(f'Prepared days {old+1}-{args.through}; existing lessons unchanged.')
