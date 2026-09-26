/* Ivory English. One player owns audio, speech, word highlights, and cancellation. */
'use strict';
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
const esc=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=(n)=>String(n).padStart(2,'0');
// Resolve bundled files inside the current site, including project subpaths.
const assetURL=(url)=>new URL(url.replace(/^\/(?!\/)/,''),document.baseURI).href;
const clock=(seconds)=>{const s=Math.max(0,Math.round(seconds||0));return `${Math.floor(s/60)}:${pad(s%60)}`;};
const paths={play:'<path d="m9 5 11 7-11 7Z"/>',pause:'<path d="M9 5v14M15 5v14"/>',stop:'<rect x="6" y="6" width="12" height="12" rx="1"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',back:'<path d="M19 12H5m5-5-5 5 5 5"/>',headphones:'<path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/>',book:'<path d="M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-3-1-6 0-9 2-3-2-6-3-9-2Z"/>',repeat:'<path d="M19 8a8 8 0 0 0-13-2L3 9m0-5v5h5m-3 7a8 8 0 0 0 13 2l3-3m0 5v-5h-5"/>',check:'<path d="m5 12 4 4L19 6"/>',volume:'<path d="M11 5 6 9H3v6h3l5 4Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>'};
const icon=(name)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.play}</svg>`;
const main=$('#main');
let indexData=null,currentLesson=null,routeVersion=0,routeAbort=null,toastTimer=null;
let storyTokens=[],storyPieces=[],storyText='',seen=new Set();
let voices=[],audioMode='recorded';
let progress={lastDay:1,completed:[],listened:{}};
try{const saved=JSON.parse(localStorage.getItem('ivory.progress.v1')||'null');if(saved&&typeof saved==='object'){progress.lastDay=Number.isInteger(saved.lastDay)&&saved.lastDay>=1&&saved.lastDay<=90?saved.lastDay:1;progress.completed=Array.isArray(saved.completed)?saved.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=90):[];progress.listened=saved.listened&&typeof saved.listened==='object'?saved.listened:{};}}catch{}
const saveProgress=()=>{try{localStorage.setItem('ivory.progress.v1',JSON.stringify(progress));}catch{}};
const isPublished=day=>!!indexData?.days.find(d=>d.day===day&&d.available!==false);
const availableDays=()=>indexData.days.filter(d=>d.available!==false);

const defaultPrefs={speed:1.5,volume:1,hideArabic:false,shadow:false,repeat:1,voice:''};
let prefs={...defaultPrefs};
try{const saved=JSON.parse(localStorage.getItem('ivory.preferences.v1')||'{}');for(const k of Object.keys(defaultPrefs))if(k in saved)prefs[k]=saved[k];}catch{}
if(![.5,.75,1,1.25,1.5,1.75,2,2.5].includes(prefs.speed))prefs.speed=1.5;
if(typeof prefs.volume!=='number'||prefs.volume<0||prefs.volume>1)prefs.volume=1;
prefs.repeat=prefs.repeat===3?3:1;
const savePrefs=()=>{try{localStorage.setItem('ivory.preferences.v1',JSON.stringify(prefs));}catch{}};
function toast(message){clearTimeout(toastTimer);const t=$('#toast');t.textContent=message;t.hidden=false;toastTimer=setTimeout(()=>t.hidden=true,4500);}
function wordCount(s){return (s.match(/\S+/g)||[]).length;}
function buildStory(story){
  storyTokens=[];storyPieces=[];let offset=0,wordId=0,pieceId=0;
  const sections=story.sections.map((section,sectionIndex)=>{
    const ps=section.paragraphs.map((p)=>{
      const matches=[...p.matchAll(/\S+/g)];
      const targets=(currentLesson?.sentences||[]).flatMap(s=>{const start=p.indexOf(s.en);return start<0?[]:[{start,end:start+s.en.length}];});
      const words=matches.map((m)=>{const t={word:m[0],start:offset+m.index,end:offset+m.index+m[0].length,index:wordId++};storyTokens.push(t);const learned=targets.some(r=>m.index+m[0].length>r.start&&m.index<r.end);return `<span class="story-word${learned?' lesson-word':''}" data-word="${t.index}">${esc(m[0])}</span>`;});
      const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('en',{granularity:'sentence'}):null;
      const segments=segmenter?[...segmenter.segment(p)].map(s=>({text:s.segment,index:s.index})):Array.from(p.matchAll(/[^.!?]+[.!?]+[”"']*\s*|[^.!?]+$/g),m=>({text:m[0],index:m.index}));
      for(const segment of segments){
        const text=segment.text.trim();if(!text)continue;
        const trim=segment.text.indexOf(text);
        storyPieces.push({text,start:offset+segment.index+trim,end:offset+segment.index+trim+text.length,id:pieceId++});
      }
      offset+=p.length+2;
      return `<p>${words.join(' ')}</p>`;
    }).join('');
    return `<section class="story-chapter" data-chapter="${sectionIndex}"><h4>${esc(section.heading)}</h4>${ps}</section>`;
  }).join('');
  storyText=story.sections.flatMap(s=>s.paragraphs).join('\n\n');
  return sections;
}
function closestToken(charIndex){let lo=0,hi=storyTokens.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(storyTokens[mid].start<=charIndex)lo=mid;else hi=mid-1;}return lo;}
function findCue(cues,time){let lo=0,hi=cues.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(cues[mid].start<=time)lo=mid;else hi=mid-1;}return cues[lo];}

class LearningPlayer{
  constructor(){
    this.audio=new Audio();this.audio.preload='metadata';this.audio.preservesPitch=true;
    this.kind=null;this.position=0;this.playing=false;this.paused=false;this.token=0;this.timer=null;this.utterance=null;this.file=false;this.repeatIndex=0;this.all=false;this.storyWord=-1;this.nativePosition=0;this.startedAt=0;this.boundaries=false;this.lastFollow=0;
    this.audio.addEventListener('timeupdate',()=>this.onFileTime());
    this.raf=0;this.frameTime=0;
    const frame=(now)=>{if(this.playing&&this.file){if(now-this.frameTime>35){this.onFileTime();this.frameTime=now;}this.raf=requestAnimationFrame(frame);}else this.raf=0;};
    this.audio.addEventListener('playing',()=>{if(!this.raf)this.raf=requestAnimationFrame(frame);});
    this.audio.addEventListener('ended',()=>this.onFileEnd());
    this.audio.addEventListener('error',()=>{if(this.file&&this.kind){this.stop();toast('تعذر تحميل الملف الصوتي. حاول مرة أخرى أو اختر صوت الجهاز.');}});
  }
  stop(keep=false){
    this.token++;clearTimeout(this.timer);this.timer=null;this.audio.pause();
    if('speechSynthesis' in window)window.speechSynthesis.cancel();
    this.utterance=null;this.playing=false;this.paused=false;
    if(!keep){this.kind=null;this.all=false;this.storyWord=-1;this.nativePosition=0;this.clearHighlights();}
    this.updateUI();
  }
  clearHighlights(){for(const e of $$('.active-word,.active-fragment'))e.classList.remove('active-word','active-fragment');}
  get selectedVoice(){return voices.find(v=>v.voiceURI===prefs.voice)||voices.find(v=>/en-US/i.test(v.lang)&&/Aria|Samantha|Jenny|Natural/i.test(v.name))||voices.find(v=>/^en[-_]US/i.test(v.lang))||voices[0]||null;}
  async playSentence(n,all=false,repeats=null){
    const list=currentLesson?.sentences||indexData?.bonus;
    if(!list||!list[n])return;
    this.stop();this.kind='sentence';this.position=n;this.all=all;this.repeatIndex=0;this.repeatCount=repeats||prefs.repeat;
    this.file=audioMode==='recorded'&&!!currentLesson?.audio?.sentences;
    this.playing=true;
    if(this.file){const data=currentLesson.audio.sentences;this.clip=data.clips[n];this.setFile(this.clip.url||data.url,this.clip.start);await this.startFile();}
    else this.speak(list[n].en,0,()=>this.finishSentence());
    this.updateUI();
  }
  setFile(url,start){url=assetURL(url);if(this.audio.getAttribute('src')!==url){this.audio.src=url;this.audio.load();}this.audio.currentTime=Math.max(0,start);this.audio.playbackRate=prefs.speed;this.audio.volume=prefs.volume;}
  async startFile(){
    const version=this.token;
    try{await this.audio.play();if(version!==this.token)return;this.playing=true;this.paused=false;this.updateUI();}
    catch(e){if(version!==this.token)return;this.playing=false;this.paused=true;this.updateUI();toast('لم يبدأ الصوت. اضغط التشغيل مرة أخرى، وتأكد من السماح بالصوت.');}
  }
  finishSentence(){
    if(this.kind!=='sentence')return;
    this.audio.pause();seen.add(this.position);if(currentLesson?.day){progress.listened[currentLesson.day]=[...seen];saveProgress();}
    const index=this.position,repeat=++this.repeatIndex,all=this.all,token=this.token;
    this.playing=false;
    const el=$(`[data-sentence="${index}"] .audio-line span`);if(el)el.style.width='100%';
    this.updateUI();
    const list=currentLesson?.sentences||indexData.bonus;
    const delay=prefs.shadow?Math.max(1800,wordCount(list[index].en)/2.5/prefs.speed*1000):450;
    if(prefs.shadow){const s=$('#play-status');if(s)s.textContent='دورك الآن: كرر الجملة بصوتك.';}
    if(repeat<this.repeatCount){
      this.timer=setTimeout(()=>{if(token!==this.token)return;this.playing=true;if(this.file){this.audio.currentTime=this.clip.start;this.startFile();}else this.speak(list[index].en,0,()=>this.finishSentence());this.updateUI();},delay);
    }else if(all&&index<list.length-1){
      this.timer=setTimeout(()=>{if(token!==this.token)return;this.playSentence(index+1,true);},delay);
    }else{this.timer=setTimeout(()=>{if(token!==this.token)return;this.stop();if(all)toast('أكملت الاستماع للجمل. تقدر تبدأ القصة الآن.');},prefs.shadow?delay:50);}
  }
  async playStory(word=0){
    if(!currentLesson?.story||!storyTokens.length)return;
    this.stop();this.kind='story';this.file=audioMode==='recorded'&&!!currentLesson.audio?.story;
    this.playing=true;this.storyWord=Math.max(0,Math.min(word,storyTokens.length-1));
    if(this.file){const data=currentLesson.audio.story;const cue=data.words.find(c=>c.index>=this.storyWord)||data.words.at(-1);this.setFile(data.url,word===0?0:cue?.start||0);await this.startFile();}
    else{this.nativePosition=storyTokens[this.storyWord].start;this.speakStoryPiece();}
    this.updateUI();
  }
  speakStoryPiece(){
    if(this.kind!=='story')return;
    let piece=storyPieces.find(p=>p.end>this.nativePosition);
    if(!piece){this.stop();toast('انتهت القصة. أحسنت الاستماع.');return;}
    const start=Math.max(piece.start,this.nativePosition);
    this.nativePosition=start;
    const text=storyText.slice(start,piece.end);
    this.speak(text,start,()=>{this.nativePosition=piece.end;this.speakStoryPiece();});
  }
  speak(text,start,onend){
    if(!('speechSynthesis'in window)||typeof SpeechSynthesisUtterance==='undefined'){this.stop();toast('جهازك لا يدعم النطق المباشر. اختر الملف الصوتي إذا كان متاحًا.');return;}
    const version=this.token,utterance=new SpeechSynthesisUtterance(text);
    this.utterance=utterance;utterance.lang=this.selectedVoice?.lang||'en-US';utterance.voice=this.selectedVoice;utterance.rate=prefs.speed;utterance.volume=prefs.volume;
    this.boundaries=false;this.startedAt=Date.now();
    utterance.onstart=()=>{if(version!==this.token)return;this.playing=true;this.paused=false;if(this.kind==='story')this.highlightFragment(start,start+text.length);this.updateUI();};
    utterance.onboundary=(e)=>{if(version!==this.token||!this.playing||e.name==='sentence')return;this.boundaries=true;if(this.kind==='story'){this.nativePosition=start+e.charIndex;this.highlight(closestToken(this.nativePosition));}else{const bar=$(`[data-sentence="${this.position}"] .audio-line span`);if(bar)bar.style.width=`${Math.min(99,(e.charIndex+1)/text.length*100)}%`;}this.updateProgress();};
    utterance.onend=()=>{if(version!==this.token)return;this.utterance=null;onend();};
    utterance.onerror=(e)=>{if(version!==this.token||e.error==='canceled'||e.error==='interrupted')return;this.stop();toast('تعذر تشغيل هذا الصوت. جرّب صوتًا إنجليزيًا آخر أو الملف الصوتي.');};
    window.speechSynthesis.speak(utterance);
  }
  async toggle(){
    if(!this.kind)return;
    if(this.playing||this.timer){
      clearTimeout(this.timer);this.timer=null;
      if(this.file)this.audio.pause();else{this.token++;window.speechSynthesis.cancel();this.utterance=null;}
      this.playing=false;this.paused=true;this.updateUI();
    }else{
      this.playing=true;this.paused=false;
      if(this.file){if(this.kind==='sentence'&&this.audio.currentTime>=this.clip.end-.04)this.audio.currentTime=this.clip.start;await this.startFile();}
      else if(this.kind==='story')this.speakStoryPiece();
      else this.speak((currentLesson?.sentences||indexData.bonus)[this.position].en,0,()=>this.finishSentence());
      this.updateUI();
    }
  }
  configure(){
    if(this.file){this.audio.playbackRate=prefs.speed;this.audio.volume=prefs.volume;}
    else if(this.playing){const kind=this.kind,pos=this.position,all=this.all,word=this.storyWord;this.stop();if(kind==='story')this.playStory(Math.max(0,word));else if(kind==='sentence')this.playSentence(pos,all);}
    this.updateUI();
  }
  onFileTime(){
    if(!this.file||!this.kind)return;
    const time=this.audio.currentTime;
    if(this.kind==='sentence'){
      const bar=$(`[data-sentence="${this.position}"] .audio-line span`);
      if(bar)bar.style.width=`${Math.min(100,Math.max(0,(time-this.clip.start)/(this.clip.end-this.clip.start)*100))}%`;
      if(time>=this.clip.end-.035&&this.playing){this.finishSentence();return;}
    }else{
      const cue=findCue(currentLesson.audio.story.words,time);
      if(cue&&time>=cue.start&&time<=cue.end+.25)this.highlight(cue.index);
      this.updateProgress();
    }
  }
  onFileEnd(){if(!this.file||!this.kind)return;if(this.kind==='sentence'){if(this.playing)this.finishSentence();}else{this.stop();toast('انتهت القصة. أحسنت الاستماع.');}}
  highlightFragment(start,end){
    this.clearHighlights();for(const t of storyTokens){if(t.start>=start&&t.start<end)$(`[data-word="${t.index}"]`)?.classList.add('active-fragment');}
    this.storyWord=closestToken(start);this.updateProgress();this.follow();
  }
  highlight(index){
    if(this.storyWord===index&&$('.active-word'))return;
    this.clearHighlights();this.storyWord=index;$(`[data-word="${index}"]`)?.classList.add('active-word');this.follow();
  }
  follow(){
    if(!$('#follow-story')?.checked||Date.now()-this.lastFollow<1100)return;
    const el=$(`[data-word="${this.storyWord}"]`);if(!el)return;
    const rect=el.getBoundingClientRect();if(rect.top<100||rect.bottom>innerHeight-65){el.scrollIntoView({block:'center',behavior:'auto'});this.lastFollow=Date.now();}
  }
  updateProgress(){
    const duration=currentLesson?.audio?.story?.duration||currentLesson?.story?.estimatedSeconds||0;
    let seconds=0;
    if(this.kind==='story')seconds=this.file?this.audio.currentTime:Math.max(0,this.storyWord)/Math.max(1,storyTokens.length)*duration;
    const seek=$('#story-seek');if(seek&&document.activeElement!==seek)seek.value=String(duration?seconds/duration*1000:0);
    const time=$('#story-time');if(time)time.textContent=`${clock(seconds/prefs.speed)} / ${clock(duration/prefs.speed)}${this.file||currentLesson?.audio?.story&&audioMode==='recorded'?'':' ≈'}`;
    const status=$('#story-status');if(status)status.textContent=this.kind==='story'&&!this.file?(this.boundaries?'تظليل متزامن مع كلمات الصوت المختار.':'تتبع على مستوى الجملة. ينتقل إلى الكلمات عندما يوفّر الصوت توقيتها.'):currentLesson?.audio?.story?'الكلمة المظللة تتبع توقيت الملف الصوتي. اضغط على كلمة لتبدأ من عندها.':'الصوت من جهازك. دقة تظليل الكلمات تعتمد على دعم الصوت والمتصفح.';
  }
  updateUI(){
    for(const card of $$('.sentence-card')){const active=this.kind==='sentence'&&Number(card.dataset.sentence)===this.position;card.classList.toggle('playing',active);const b=$('.sentence-play',card);if(b){b.innerHTML=icon(active&&this.playing?'pause':'play');b.setAttribute('aria-label',`${active&&this.playing?'Pause':'Play'} sentence ${Number(card.dataset.sentence)+1}`);}}
    const storyPlay=$('#story-play');if(storyPlay){const p=this.kind==='story'&&this.playing;storyPlay.innerHTML=`${icon(p?'pause':'play')} ${p?'Pause story':'Play story'}`;storyPlay.setAttribute('aria-label',p?'Pause story':'Play story');}
    const playAll=$('#play-all');if(playAll){const p=this.kind==='sentence'&&this.all&&this.playing;playAll.innerHTML=`${icon(p?'pause':'play')} ${p?'Pause listening':'Listen to all 34'}`;}
    const count=$('#listened-count');if(count)count.textContent=`${seen.size} / ${currentLesson?.sentences.length||4} listened`;
    const status=$('#play-status');if(status)status.textContent=this.kind==='sentence'&&this.playing?`الجملة ${this.position+1} من ${currentLesson?.sentences.length||4}${this.repeatCount===3?' · التكرار '+(this.repeatIndex+1)+' من 3':''}`:this.paused?'متوقف مؤقتًا. اضغط التشغيل للمتابعة.':'';
    this.updateProgress();
  }
}
const player=new LearningPlayer();

function renderHome(){
  const published=availableDays(),count=published.length,complete=progress.completed.filter(isPublished).length;
  const resume=isPublished(progress.lastDay)?progress.lastDay:published[0].day;
  const chapters=[['I','Foundations','الأساسيات',1,30],['II','Everyday confidence','مواقف الحياة والعمل',31,60],['III','Beyond the basics','محادثات أعمق',61,90]];
  main.innerHTML=`<section class="intro"><div><p class="eyebrow">THE 90-DAY COLLECTION</p><h1>Your English journey.<br><em>One day at a time.</em></h1><p class="arabic-sub" lang="ar" dir="rtl">34 جملة كل يوم. استمع، كرّر، ثم عِش الكلمات في قصة.</p><a class="btn btn-primary resume-button" href="#day/${resume}">${icon('play')} ${Object.keys(progress.listened).length||progress.completed.length?'Continue':'Begin'} · Day ${pad(resume)}</a></div><div class="programme-stats"><div class="stat"><strong>${count}</strong><span>LESSONS AVAILABLE</span></div><div class="stat-divider"></div><div class="stat"><strong>34</strong><span>SENTENCES PER DAY</span></div><div class="stat-divider"></div><div class="stat"><strong>${count}</strong><span>READ-ALONG STORIES</span></div></div></section>
  <div class="release-note" lang="ar" dir="rtl"><strong>الأيام 1–${count} متاحة الآن</strong><span>${count<90?'باقي الأيام تُضاف على دفعات هنا.':''} تقدّمك محفوظ في هذا المتصفح.</span><span>${complete} / ${count} أيام مكتملة</span></div>
  <div class="curriculum-note"><span class="small-note text-icon">${icon('book')} Choose a day to begin</span><span class="small-note" lang="ar" dir="rtl">خطة من 90 يومًا · كل خطوة لها وقتها</span></div>
  ${chapters.map(([roman,title,ar,start,end])=>`<section class="chapter" aria-label="${esc(title)}"><div class="chapter-heading"><span class="chapter-numeral">${roman}.</span><h2>${title}</h2><span class="chapter-ar" lang="ar" dir="rtl">${ar}</span><span class="chapter-range">DAYS ${pad(start)}—${pad(end)}</span></div><div class="day-grid">${indexData.days.filter(d=>d.day>=start&&d.day<=end).map(d=>{
    const available=d.available!==false,done=progress.completed.includes(d.day);
    const tag=available?'a':'div';
    return `<${tag} class="day-card ${available?(d.day===resume?'current':''):'unpublished'} ${done?'completed':''}" ${available?`href="#day/${d.day}" aria-label="Day ${d.day}: ${esc(d.title)}. 34 sentences and a story.${done?' Completed.':''}"`:'aria-label="Available in a later update"'}><div class="day-card-top"><span>DAY</span>${done?icon('check'):available&&d.day===resume?icon('arrow'):''}</div><div class="day-number">${pad(d.day)}</div><div class="day-title">${esc(d.title)}</div><div class="day-meta">${available?`<span>${done?'Completed':'34 sentences'}</span><span>${icon('headphones')} 20 min</span>`:'<span lang="ar" dir="rtl">تُضاف لاحقًا</span>'}</div></${tag}>`;
  }).join('')}</div></section>`).join('')}
  <section class="bonus-panel"><span class="bonus-mark">+4</span><div><h2>A little extra confidence</h2><p lang="ar" dir="rtl">أربع جمل إضافية تساعدك إذا توقفت المحادثة.</p></div><a class="btn" href="#bonus">The final four ${icon('arrow')}</a></section>`;
  const footer=$('.site-footer');if(footer)footer.children[1].textContent=`${count} of 90 days available · One day at a time.`;
}
function renderUnpublished(day){
  main.innerHTML=`<div class="error-panel"><p class="eyebrow">DAY ${pad(day)}</p><h1>This lesson is on its way.</h1><p lang="ar" dir="rtl">اليوم ${day} يُضاف في دفعة لاحقة. تقدر تبدأ بالأيام المتاحة الآن.</p><a class="btn btn-primary" href="#days">Back to the collection ${icon('book')}</a></div>`;
  document.title=`Day ${pad(day)} · Coming later · Ivory English`;
}
function sentenceMarkup(s,n){
  const seconds=currentLesson?.audio?.sentences?.clips[n]?currentLesson.audio.sentences.clips[n].end-currentLesson.audio.sentences.clips[n].start:wordCount(s.en)/2.6;
  return `<article class="sentence-card" data-sentence="${n}"><div class="sentence-top"><span class="sentence-index">${pad(n+1)}</span><div class="sentence-body"><p class="sentence-en" lang="en">${esc(s.en)}</p><p class="sentence-ar" lang="ar" dir="rtl" ${prefs.hideArabic?'hidden':''}>${esc(s.ar)}</p>${prefs.hideArabic?'<button class="translation-reveal" type="button" lang="ar">إظهار الترجمة</button>':''}</div></div><div class="sentence-player"><button type="button" class="sentence-play" aria-label="Play sentence ${n+1}">${icon('play')}</button><div class="audio-line" aria-hidden="true"><span></span></div><span class="audio-time">${currentLesson?.audio?.sentences?'':'≈ '}${clock(seconds/prefs.speed)}</span><button type="button" class="repeat-button" aria-label="Repeat sentence ${n+1} three times" title="Repeat three times">${icon('repeat')}</button>${currentLesson?.audio?.sentences?.clips[n]?.url?`<a class="repeat-button" href="${esc(assetURL(currentLesson.audio.sentences.clips[n].url))}" download aria-label="Download sentence ${n+1} audio" title="Download MP3">${icon('download')}</a>`:''}</div></article>`;
}
function sidebarMarkup(){return `<aside class="lesson-sidebar" aria-label="Listening settings"><h2 class="sidebar-heading">Make it your pace.</h2><div class="sidebar-group"><label class="control-label" for="voice-select">English voice <span>الصوت</span></label><select id="voice-select" aria-label="English voice"></select><p class="control-label"><span>Playback speed</span><strong id="speed-value">${prefs.speed}×</strong></p><div class="speed-options" aria-label="Playback speed">${[.5,.75,1,1.25,1.5,1.75,2,2.5].map(s=>`<button class="speed-option ${prefs.speed===s?'active':''}" data-speed="${s}" aria-pressed="${prefs.speed===s}">${s}×</button>`).join('')}</div><label class="control-label" for="volume">Volume <span id="volume-value">${Math.round(prefs.volume*100)}%</span></label><input id="volume" class="range" type="range" min="0" max="100" step="1" value="${Math.round(prefs.volume*100)}" aria-label="Volume"></div><div class="sidebar-group"><div class="sidebar-divider"></div><label class="check-label" for="hide-arabic"><span>Recall the meaning</span><input id="hide-arabic" type="checkbox" ${prefs.hideArabic?'checked':''}></label><p class="sidebar-help" lang="ar" dir="rtl">أخفِ الترجمة، حاول تتذكر المعنى، ثم اكشفها للتأكد.</p><label class="check-label" for="shadow"><span>Listen & repeat</span><input id="shadow" type="checkbox" ${prefs.shadow?'checked':''}></label><p class="sidebar-help" lang="ar" dir="rtl">وقفة بعد كل جملة تعطيك وقت تكررها بصوتك.</p><label class="check-label" for="repeat"><span>Repeat each line 3×</span><input id="repeat" type="checkbox" ${prefs.repeat===3?'checked':''}></label><div class="sidebar-divider"></div><a class="btn btn-subtle" style="width:100%" href="#daily-story">Today's story ${icon('book')}</a></div><p class="sidebar-help" lang="ar" dir="rtl">إعداداتك محفوظة على هذا الجهاز. أمثلة التعريف بالنفس للتدرب؛ غيّر تفاصيلها لتناسبك.</p></aside>`;}
function renderLesson(data){
  currentLesson=data;seen=new Set((Array.isArray(progress.listened[data.day])?progress.listened[data.day]:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<34));progress.lastDay=data.day;saveProgress();const story=buildStory(data.story);const actual=data.audio?.story?.duration;
  main.innerHTML=`<div class="breadcrumb"><a class="btn-text" href="#days">${icon('back')} The 90-day plan</a><span class="small-note">DAY ${pad(data.day)} OF 90</span></div>
  <section class="lesson-intro"><span class="lesson-number">${pad(data.day)}</span><div><p class="eyebrow">YOUR DAILY ENGLISH PRACTICE</p><h1>${esc(data.title)}</h1><p class="small-note" lang="ar" dir="rtl">${esc(data.titleAr)} · 34 جملة وقصة اليوم</p></div><span class="lesson-pill">${data.day<=30?'FOUNDATIONS':data.day<=60?'EVERYDAY CONFIDENCE':'BEYOND THE BASICS'}</span></section>
  <div class="lesson-layout"><div class="lesson-content"><div class="lesson-tools"><button class="btn btn-primary" id="play-all">${icon('play')} Listen to all 34</button><button class="icon-btn" id="stop-all" aria-label="Stop listening">${icon('stop')}</button><span id="listened-count" class="small-note">0 / 34 listened</span></div><p id="play-status" class="play-status" aria-live="polite" lang="ar" dir="rtl"></p><section id="sentences" aria-label="Today's 34 sentences">${data.sentences.map(sentenceMarkup).join('')}</section>
  <div class="section-caption"><h2>Words become a story.</h2><span>THE DAILY READER</span></div><article class="story" id="daily-story"><p class="eyebrow">THE IVORY HOUSE COLLECTION · DAY ${pad(data.day)}</p><h3>${esc(data.story.title)}</h3><p class="story-desc" lang="ar" dir="rtl">قصة تدريبية قصيرة تستخدم جمل اليوم الـ34. يمكنك قراءتها أو تشغيلها بصوت المتصفح الإنجليزي.</p>
  <div class="story-player"><div class="story-controls"><button class="btn btn-primary" id="story-play">${icon('play')} Play story</button><button class="icon-btn" id="story-restart" aria-label="Restart story">${icon('repeat')}</button><button class="icon-btn" id="story-stop" aria-label="Stop story">${icon('stop')}</button><span id="story-time" class="time">0:00 / ${clock((actual||data.story.estimatedSeconds)/prefs.speed)}${actual?'':' ≈'}</span></div><input id="story-seek" class="story-position" type="range" min="0" max="1000" step="1" value="0" aria-label="Story position"><label class="check-label" for="follow-story"><span>Follow the words <span lang="ar">· تتبع القراءة</span></span><input id="follow-story" type="checkbox" checked></label><label class="sr-only" for="story-chapter-select" style="font-size:.75rem;color:var(--muted)">Jump to a chapter</label><select id="story-chapter-select" aria-label="Jump to a story chapter">${data.story.sections.map((s,i)=>`<option value="${i}">${i+1}. ${esc(s.heading)}</option>`).join('')}</select><p id="story-status" class="story-status" lang="ar" dir="rtl"></p></div><div class="story-text" lang="en">${story}</div>${data.audio?.story?`<a class="btn btn-subtle" href="${esc(assetURL(data.audio.story.url))}" download>${icon('download')} Download story · MP3</a>`:''}</article><div class="completion-panel"><button class="btn btn-primary" id="complete-day" aria-pressed="${progress.completed.includes(data.day)}">${icon('check')} ${progress.completed.includes(data.day)?'Day completed · مكتمل':'Mark day complete · أنهيت اليوم'}</button><span class="small-note" lang="ar" dir="rtl">تقدّمك محفوظ في هذا المتصفح.</span></div><div class="lesson-end">${data.day>1?`<a class="btn btn-subtle" href="#day/${data.day-1}">${icon('back')} Day ${pad(data.day-1)}</a>`:'<a class="btn btn-subtle" href="#days">All days</a>'}${isPublished(data.day+1)?`<a class="btn btn-primary" href="#day/${data.day+1}">Day ${pad(data.day+1)} ${icon('arrow')}</a>`:'<a class="btn btn-primary" href="#bonus">The final four '+icon('arrow')+'</a>'}</div></div>${sidebarMarkup()}</div>`;
  audioMode=data.audio?.sentences?'recorded':'device';
  $('#complete-day').onclick=()=>{const done=progress.completed.includes(data.day);progress.completed=done?progress.completed.filter(n=>n!==data.day):[...progress.completed,data.day];saveProgress();const button=$('#complete-day');button.setAttribute('aria-pressed',String(!done));button.innerHTML=icon('check')+' '+(!done?'Day completed · مكتمل':'Mark day complete · أنهيت اليوم');};
  attachSentenceEvents();attachSettings();populateVoices();
  $('#play-all').onclick=()=>{if(player.kind==='sentence'&&player.all)player.toggle();else player.playSentence(0,true);};
  $('#stop-all').onclick=()=>player.stop();
  $('#story-play').onclick=()=>{if(player.kind==='story')player.toggle();else player.playStory();};
  $('#story-restart').onclick=()=>player.playStory();
  $('#story-stop').onclick=()=>player.stop();
  $('#story-seek').onchange=(e)=>{const ratio=Number(e.target.value)/1000;const audio=data.audio?.story;const word=audioMode==='recorded'&&audio?findCue(audio.words,ratio*audio.duration)?.index:Math.floor(ratio*storyTokens.length);player.playStory(Math.min(storyTokens.length-1,word||0));};
  $('#story-chapter-select').onchange=e=>{const word=$(`[data-chapter="${e.target.value}"] [data-word]`);if(word)player.playStory(Number(word.dataset.word));};
  $('.story-text').onclick=(e)=>{const word=e.target.closest('[data-word]');if(word)player.playStory(Number(word.dataset.word));};
  $('a[href="#daily-story"]').onclick=e=>{e.preventDefault();$('#daily-story').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
  player.updateUI();
}
function attachSentenceEvents(){
  for(const card of $$('.sentence-card')){const n=Number(card.dataset.sentence);$('.sentence-play',card).onclick=()=>{if(player.kind==='sentence'&&player.position===n)player.toggle();else player.playSentence(n);};$('.repeat-button',card).onclick=()=>player.playSentence(n,false,3);const b=$('.translation-reveal',card);if(b)b.onclick=()=>{$('.sentence-ar',card).hidden=false;b.hidden=true;};}
}
function populateVoices(){
  const select=$('#voice-select');if(!select)return;
  voices=('speechSynthesis'in window?window.speechSynthesis.getVoices():[]).filter(v=>/^en(?:[-_]|$)/i.test(v.lang));
  select.innerHTML=(currentLesson?.audio?.sentences?'<option value="recorded">English · Audio recording</option>':'')+voices.map(v=>`<option value="${esc(v.voiceURI)}">${esc(v.name)} (${esc(v.lang)})</option>`).join('')+'<option value="device">Device default · English</option>';
  select.value=audioMode==='recorded'&&currentLesson?.audio?.sentences?'recorded':voices.some(v=>v.voiceURI===prefs.voice)?prefs.voice:'device';
  select.onchange=()=>{const was=player.playing,kind=player.kind,n=player.position,w=player.storyWord,all=player.all;player.stop();audioMode=select.value==='recorded'?'recorded':'device';prefs.voice=select.value==='recorded'||select.value==='device'?'':select.value;savePrefs();if(was){if(kind==='story')player.playStory(Math.max(0,w));else if(kind==='sentence')player.playSentence(n,all);}player.updateUI();};
}
function setSpeed(speed){
  if(![.5,.75,1,1.25,1.5,1.75,2,2.5].includes(speed))throw Error('Unsupported speed');
  prefs.speed=speed;savePrefs();
  for(const b of $$('.speed-option')){const a=Number(b.dataset.speed)===speed;b.classList.toggle('active',a);b.setAttribute('aria-pressed',String(a));}
  const s=$('#speed-value');if(s)s.textContent=`${speed}×`;
  for(const [n,card] of $$('.sentence-card').entries()){const line=(currentLesson?.sentences||indexData.bonus)[n];const c=currentLesson?.audio?.sentences?.clips[n];$('.audio-time',card).textContent=`${c?'':'≈ '}${clock((c?c.end-c.start:wordCount(line.en)/2.6)/speed)}`;}
  player.configure();
}
function attachSettings(){
  for(const b of $$('.speed-option'))b.onclick=()=>setSpeed(Number(b.dataset.speed));
  $('#volume').oninput=e=>{prefs.volume=Number(e.target.value)/100;$('#volume-value').textContent=`${e.target.value}%`;savePrefs();player.configure();};
  $('#hide-arabic').onchange=e=>{prefs.hideArabic=e.target.checked;savePrefs();$('#sentences').innerHTML=currentLesson.sentences.map(sentenceMarkup).join('');attachSentenceEvents();player.updateUI();};
  $('#shadow').onchange=e=>{prefs.shadow=e.target.checked;savePrefs();};
  $('#repeat').onchange=e=>{prefs.repeat=e.target.checked?3:1;savePrefs();};
}
function renderBonus(){
  currentLesson=indexData.bonusAudio?{sentences:indexData.bonus,audio:{sentences:indexData.bonusAudio}}:null;seen=new Set();audioMode=currentLesson?'recorded':'device';
  main.innerHTML=`<div class="breadcrumb"><a class="btn-text" href="#days">${icon('back')} The 90-day plan</a><span class="small-note">THE FINAL FOUR</span></div><section class="intro"><div><p class="eyebrow">3,060 + 4 = 3,064</p><h1>A little extra <em>confidence.</em></h1><p class="arabic-sub" lang="ar" dir="rtl">أربع جمل تعطيك مساحة تفكر وتوضح المعنى أثناء المحادثة.</p></div></section><section class="bonus-sentences" aria-label="Four bonus sentences">${indexData.bonus.map(sentenceMarkup).join('')}<div class="lesson-end"><a class="btn" href="#day/${availableDays().at(-1).day}">${icon('back')} Day ${pad(availableDays().at(-1).day)}</a><a class="btn btn-primary" href="#days">Back to the collection ${icon('book')}</a></div></section>`;
  attachSentenceEvents();
}
async function readJSON(url,signal){const r=await fetch(assetURL(url),{signal,...(url.endsWith('/index.json')?{cache:'no-store'}:{})});if(!r.ok)throw Error('Lesson could not be loaded');return r.json();}
async function navigate(){
  if(location.hash==='#daily-story'&&currentLesson?.story){$('#daily-story')?.scrollIntoView();return;}
  const version=++routeVersion;routeAbort?.abort();routeAbort=new AbortController();player.stop();currentLesson=null;storyTokens=[];storyPieces=[];storyText='';seen=new Set();
  const hash=location.hash||'#days';window.scrollTo(0,0);
  try{
    if(!indexData)indexData=await readJSON('/data/index.json',routeAbort.signal);
    if(version!==routeVersion)return;
    if(hash==='#days'||hash==='#'){renderHome();document.title='Ivory English · Your daily language library';}
    else if(hash==='#bonus'){renderBonus();document.title='The final four · Ivory English';}
    else if(/^#day\/(?:[1-9]|[1-8][0-9]|90)$/.test(hash)){
      main.innerHTML='<div class="loading" role="status">Opening your lesson…<span lang="ar">جاري تحميل درس اليوم</span></div>';
      const day=Number(hash.split('/')[1]);if(!isPublished(day)){renderUnpublished(day);main.focus({preventScroll:true});return;}const data=await readJSON(`/data/day-${pad(day)}.json`,routeAbort.signal);
      if(version!==routeVersion)return;renderLesson(data);document.title=`Day ${pad(day)} · ${data.title} · Ivory English`;
    }else{renderHome();history.replaceState(null,'','#days');}
    main.focus({preventScroll:true});
  }catch(e){if(e.name==='AbortError'||version!==routeVersion)return;main.innerHTML='<div class="error-panel" role="alert"><h1>Your lesson could not open.</h1><p lang="ar" dir="rtl">تعذر تحميل الدرس. تحقق من اتصالك ثم حاول مرة أخرى.</p><button class="btn" id="retry-load">Try again</button></div>';$('#retry-load').onclick=navigate;}
}
window.addEventListener('hashchange',navigate);
window.addEventListener('pagehide',()=>player.stop());
if('speechSynthesis'in window)window.speechSynthesis.addEventListener('voiceschanged',populateVoices);

// Optional imperative WebMCP; shares the exact same lesson and settings actions.
function registerLearningTools(){
  const registry=document.modelContext;if(!registry?.registerTool)return;
  const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  const definitions=[{
    name:'open_english_day',title:'Open a daily English lesson',description:'Open a published English lesson. Days not yet released display an availability notice. Does not start audio or mark a lesson complete.',inputSchema:{type:'object',properties:{day:{type:'integer',minimum:1,maximum:90}},required:['day'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},
    async execute(input){if(!input||Object.keys(input).some(k=>k!=='day')||!Number.isInteger(input.day)||input.day<1||input.day>90)throw Error('day must be an integer from 1 to 90');history.replaceState(null,'',`#day/${input.day}`);await navigate();if(currentLesson?.day!==input.day)throw Error('Lesson could not open');return {day:currentLesson.day,title:currentLesson.title,sentences:currentLesson.sentences.length};}
  },{
    name:'set_english_playback_speed',title:'Set listening speed',description:'Change the visible English listening speed. Does not start stopped audio.',inputSchema:{type:'object',properties:{speed:{type:'number',enum:[.5,.75,1,1.25,1.5,1.75,2,2.5]}},required:['speed'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input){if(!input||Object.keys(input).some(k=>k!=='speed')||!currentLesson?.story)throw Error('Open a daily lesson first');setSpeed(input.speed);return {speed:prefs.speed};}
  }];
  for(const definition of definitions){try{Promise.resolve(registry.registerTool(definition,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
}
navigate().then(registerLearningTools);
