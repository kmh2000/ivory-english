/* Contract checks only. These do not replace a real-browser visual/audio test. */
const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert');
const root=process.env.IVORY_TEST_ROOT||path.resolve(__dirname,'..','dist');
const siteURL=process.argv[2]||'https://ivory.test/';
const baseURL=new URL('./',siteURL);
const dom=new JSDOM(fs.readFileSync(root+'/index.html','utf8'),{url:siteURL+'#days',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;
w.scrollTo=()=>{};w.matchMedia=()=>({matches:true});w.HTMLElement.prototype.scrollIntoView=()=>{};
class Audio extends w.EventTarget{constructor(){super();this.currentTime=0;this.src='';this.volume=1;this.playbackRate=1;}getAttribute(k){return this[k];}load(){}pause(){}async play(){}}
w.Audio=Audio;w.speechSynthesis=new w.EventTarget();w.speechSynthesis.cancel=()=>{};
w.speechSynthesis.getVoices=()=>[];w.speechSynthesis.speak=u=>{w.utter=u;u.onstart?.();};
w.SpeechSynthesisUtterance=class{constructor(t){this.text=t;}};
function localAssetPath(url){
 const resolved=new URL(url,w.location.href);
 assert.equal(resolved.origin,baseURL.origin);
 assert(resolved.pathname.startsWith(baseURL.pathname),'Asset escaped site path: '+url);
 const filename=path.join(root,resolved.pathname.slice(baseURL.pathname.length));
 assert(fs.statSync(filename).isFile(),'Missing asset: '+url);
 return filename;
}
w.fetch=async(url)=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(localAssetPath(url),'utf8'))});
w.eval(fs.readFileSync(root+'/app.js','utf8')+'\nwindow.testAPI={navigate,player,setSpeed,getLesson:()=>currentLesson,getTokens:()=>storyTokens};');
const tick=()=>new Promise(r=>setTimeout(r,30));
(async()=>{
 await tick();
 for(const el of w.document.querySelectorAll('script[src],link[rel="stylesheet"]'))localAssetPath(el.src||el.href);
 const links=[...w.document.querySelectorAll('a.day-card')].map(a=>a.hash);
 assert.equal(links.length,10);assert.equal(new Set(links).size,10);
 for(let day=1;day<=10;day++){
  w.history.replaceState(null,'',links[day-1]);await w.testAPI.navigate();
  const data=w.testAPI.getLesson();
  assert.equal(data.day,day);assert.equal(w.document.querySelectorAll('.sentence-card').length,34);
  assert(w.document.querySelector('.story-text'));
  const downloads=[...w.document.querySelectorAll('a[download]')];
  assert.equal(downloads.length,35);
  downloads.forEach(a=>localAssetPath(a.href));
  assert.equal(w.testAPI.getTokens().length,(data.story.sections.flatMap(s=>s.paragraphs).join('\n\n').match(/\S+/g)||[]).length);
  const targetWords=data.sentences.reduce((n,s)=>n+(s.en.match(/\S+/g)||[]).length,0);
  assert.equal(w.document.querySelectorAll('.lesson-word').length,targetWords,'Target words in day '+day);
 }
 w.history.replaceState(null,'','#day/1');await w.testAPI.navigate();
 assert.equal(w.testAPI.player.audio.volume,1);
 assert.equal(w.document.querySelector('#speed-value').textContent,'1.5×');
 await w.testAPI.player.playSentence(0);
 assert(w.testAPI.player.audio.src.endsWith('/sentence-01.mp3'));assert.equal(w.testAPI.player.audio.playbackRate,1.5);
 localAssetPath(w.testAPI.player.audio.src);
 await w.testAPI.player.toggle();assert(w.testAPI.player.paused);
 await w.testAPI.player.toggle();assert(w.testAPI.player.playing);
 w.testAPI.setSpeed(.75);assert.equal(w.testAPI.player.audio.playbackRate,.75);
 await w.testAPI.player.playStory(250);const cues=w.testAPI.getLesson().audio.story.words;
 localAssetPath(w.testAPI.player.audio.src);
 assert.equal(w.testAPI.player.audio.currentTime,cues[250].start);
 for(const n of [0,25,750,1500,2500,3000]){
  w.testAPI.player.audio.currentTime=cues[n].start+.01;w.testAPI.player.onFileTime();
  assert.equal(w.document.querySelector('.active-word').dataset.word,String(n));
 }
 w.testAPI.setSpeed(2);assert.equal(w.testAPI.player.audio.playbackRate,2);
 w.testAPI.player.stop();assert.equal(w.document.querySelectorAll('.active-word').length,0);
 w.document.querySelector('#hide-arabic').click();assert(w.document.querySelector('.sentence-ar').hidden);
 w.document.querySelector('.translation-reveal').click();assert(!w.document.querySelector('.sentence-ar').hidden);
 w.testAPI.player.stop();
 await w.testAPI.player.playSentence(0);w.testAPI.player.finishSentence();w.testAPI.player.stop();
 assert(JSON.parse(w.localStorage.getItem('ivory.progress.v1')).listened['1'].includes(0));
 w.document.querySelector('#complete-day').click();
 assert(JSON.parse(w.localStorage.getItem('ivory.progress.v1')).completed.includes(1));
 await w.testAPI.navigate();
 assert.equal(w.document.querySelector('#complete-day').getAttribute('aria-pressed'),'true');
 assert(w.document.querySelector('#listened-count').textContent.startsWith('1 /'));
 w.history.replaceState(null,'','#day/11');await w.testAPI.navigate();
 assert.equal(w.testAPI.getLesson(),null);assert(w.document.body.textContent.includes('تُضاف')||w.document.body.textContent.includes('يُضاف'));
 w.history.replaceState(null,'','#day/10');await w.testAPI.navigate();
 assert.equal(w.document.querySelector('a[href="#day/11"]'),null);
 w.history.replaceState(null,'','#days');await w.testAPI.navigate();
 assert.equal(w.document.querySelectorAll('a.day-card').length,10);
 assert.equal(w.document.querySelectorAll('.unpublished').length,80);
 assert(w.document.querySelector('a[href="#day/1"]').classList.contains('completed'));
 w.history.replaceState(null,'','#bonus');await w.testAPI.navigate();
 const bonusDownloads=[...w.document.querySelectorAll('a[download]')];assert.equal(bonusDownloads.length,4);
 bonusDownloads.forEach(a=>localAssetPath(a.href));await w.testAPI.player.playSentence(0);localAssetPath(w.testAPI.player.audio.src);
 const report={passed:true,baseURL:baseURL.href,dayRoutes:10,sentencesPerDay:34,downloadLinks:354,bonusRoute:'passed',defaultSpeed:1.5,mp3PlaybackControls:'passed with mocked media API',storyWordHighlighting:'passed against actual timing data',translationRecall:'passed',gradualRelease:'passed: 10 available, 80 pending, no broken next-day link',persistentProgress:'passed across navigation',visualDesktopMobile:'pending browser verification',note:'DOM checks are not a real-browser audio or responsive visual test.'};
 fs.writeFileSync(process.argv[3]||path.resolve(__dirname,'..','INTERACTION_AUDIT.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));dom.window.close();
})().catch(e=>{console.error(e);dom.window.close();process.exitCode=1;});
