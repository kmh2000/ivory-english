/* Warehouse inventory: encrypted, write-restricted browser data adapter.
   This script contains no inventory data, sharing key or GitHub token. */
(()=>{
'use strict';
const OWNER='kmh2000', REPO='ivory-english', PREFIX='dist/warehouse/';
const SCOPED_API='https://api.github.com/repos/'+OWNER+'/'+REPO+'/contents/';
const TOKEN_NAME='warehouse-github-session-token';
const BACKUP_NAME='warehouse-pending-update';
const secret=(new URLSearchParams(location.hash.slice(1)).get('k')||'');
const hexBytes=(text)=>Uint8Array.from(text.match(/../g).map(h=>parseInt(h,16)));
const bytes=hexBytes(secret);
const dataKey=crypto.subtle.importKey('raw',bytes,'AES-GCM',false,['encrypt','decrypt']);
let currentToken=sessionStorage.getItem(TOKEN_NAME)||'';
const imageCache=new Map();
const utf8=new TextEncoder();
const decoder=new TextDecoder('utf-8',{fatal:true});
const encode64=input=>{
 const a=input instanceof Uint8Array?input:new Uint8Array(input);
 let str='';for(let i=0;i<a.length;i+=8192)str+=String.fromCharCode(...a.subarray(i,i+8192));
 return btoa(str);
};
const decode64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const clone=obj=>JSON.parse(JSON.stringify(obj));
const baseFile=(name)=>PREFIX+name;
const apiUrl=name=>SCOPED_API+baseFile(name).split('/').map(encodeURIComponent).join('/');
const headers=()=>({'Authorization':'Bearer '+currentToken,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'});
async function sealJSON(value){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const data=utf8.encode(JSON.stringify(value));
 const result=await crypto.subtle.encrypt({name:'AES-GCM',iv},await dataKey,data);
 return JSON.stringify({v:1,n:encode64(iv),c:encode64(result)});
}
async function unsealJSON(envelope){
 if(envelope?.v!==1||typeof envelope.n!=='string'||typeof envelope.c!=='string')throw Error('صيغة بيانات غير مدعومة');
 const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode64(envelope.n)},await dataKey,decode64(envelope.c));
 return JSON.parse(decoder.decode(data));
}
async function githubPut(name,content,message){
 if(!currentToken)throw Error('يلزم الدخول بحساب الإدارة أولًا');
 const url=apiUrl(name),hdr=headers();
 const current=await fetch(url,{headers:hdr,cache:'no-store'});
 if(current.status!==200&&current.status!==404)throw Error('تعذر التأكد من النسخة الحالية في GitHub ('+current.status+')');
 const sha=current.status===200?(await current.json()).sha:null;
 const body={message,branch:'main',content:encode64(content)};
 if(sha)body.sha=sha;
 const response=await fetch(url,{method:'PUT',headers:{...hdr,'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(!response.ok){
   if(response.status===409||response.status===422)throw Error('تغيرت بيانات المستودع أثناء الحفظ. حدّث الصفحة ثم أعد المحاولة.');
   if(response.status===401||response.status===403)throw Error('صلاحية GitHub غير كافية. تأكد من منح Contents: Read and write لمستودع ivory-english.');
   throw Error('تعذر حفظ التعديل في GitHub ('+response.status+')');
 }
 return await response.json();
}
async function uploadImage(name,getLocal,uploaded){
 if(!name?.startsWith('local:'))return name||'';
 if(uploaded.has(name))return uploaded.get(name);
 const blob=await getLocal(name);if(!blob)throw Error('تعذر قراءة الصورة المختارة من جهازك');
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const payload=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await dataKey,await blob.arrayBuffer()));
 const out=new Uint8Array(iv.length+payload.length);out.set(iv);out.set(payload,iv.length);
 const safeId=crypto.randomUUID();
 const remote='uploads/'+safeId+'.bin';
 await githubPut(remote,out,'Add encrypted warehouse attachment');
 uploaded.set(name,remote);
 return remote;
}
function serialize(items,notes){
 const seed=window.WAREHOUSE_SEED||{items:[],notes:[]};
 const seedItems=new Map(seed.items.map(x=>[x.id,x]));
 const seedNotes=new Map(seed.notes.map(x=>[x.id,x]));
 const cleanItems=items.map(x=>{
   const c={...x},o=seedItems.get(x.id);
   if(o&&c.image===o.image)c.image='@seed';
   return c;
 });
 const cleanNotes=notes.map(x=>{
   const c={...x},o=seedNotes.get(x.id);
   if(o&&c.preview===o.preview)c.preview='@seed';
   if(o&&c.original===o.original)c.original='@seed';
   return c;
 });
 return {items:cleanItems,notes:cleanNotes};
}
function restore(value){
 const seed=window.WAREHOUSE_SEED||{items:[],notes:[]};
 const seedItems=new Map(seed.items.map(x=>[x.id,x]));
 const seedNotes=new Map(seed.notes.map(x=>[x.id,x]));
 const items=(value?.items||[]).map(x=>({...x,image:x.image==='@seed'?(seedItems.get(x.id)?.image||''):x.image}));
 const notes=(value?.notes||[]).map(x=>{
   const base=seedNotes.get(x.id);
   return {...x,preview:x.preview==='@seed'?(base?.preview||''):x.preview,original:x.original==='@seed'?(base?.original||''):x.original};
 });
 return {items,notes,updatedAt:Number(value.updatedAt)||0};
}
function localPending(){try{return JSON.parse(sessionStorage.getItem(BACKUP_NAME)||'null')}catch{return null}}
async function load(){
 let value=null;
 try{
   const r=await fetch('./state.enc?v='+Math.floor(Date.now()/60000),{cache:'no-store'});
   if(r.ok){value=await unsealJSON(JSON.parse(await r.text()))}
   else if(r.status!==404)throw Error('تعذر قراءة أحدث بيانات المستودع ('+r.status+')');
 }catch(error){console.warn('warehouses_remote_fetch',error);}
 const pending=localPending();
 if(pending&&(!value||Number(pending.updatedAt)>Number(value.updatedAt))){
   value=pending;
 }else if(pending&&value&&Number(value.updatedAt)>=Number(pending.updatedAt)){
   sessionStorage.removeItem(BACKUP_NAME);
 }
 return value?restore(value):null;
}
async function save(items,notes,getLocal){
 if(!currentToken){openLogin();throw Error('سجل دخول الإدارة أولًا لتتمكن من الحفظ للجميع')}
 const uploaded=new Map();
 const copiedItems=clone(items);
 const copiedNotes=clone(notes);
 for(const i of copiedItems)i.image=await uploadImage(i.image,getLocal,uploaded);
 for(const n of copiedNotes){
   n.preview=await uploadImage(n.preview,getLocal,uploaded);
   n.original=await uploadImage(n.original,getLocal,uploaded);
 }
 const compact=serialize(copiedItems,copiedNotes);
 const snapshot={v:1,updatedAt:Date.now(),...compact};
 const payload=utf8.encode(await sealJSON(snapshot));
 await githubPut('state.enc',payload,'Save warehouse inventory updates');
 // Keep the just-saved view available while GitHub Pages publishes (typically ~1 min).
 sessionStorage.setItem(BACKUP_NAME,JSON.stringify(snapshot));
 for(const i of items){const saved=copiedItems.find(x=>x.id===i.id);if(saved)i.image=saved.image}
 for(const n of notes){const saved=copiedNotes.find(x=>x.id===n.id);if(saved){n.preview=saved.preview;n.original=saved.original}}
 return snapshot.updatedAt;
}
async function image(path){
 if(!path?.startsWith('uploads/'))return path;
 if(imageCache.has(path))return imageCache.get(path);
 try{
   const response=await fetch('./'+path,{cache:'force-cache'});
   if(!response.ok)return '';
   const raw=new Uint8Array(await response.arrayBuffer());
   if(raw.length<29)return '';
   const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:raw.slice(0,12)},await dataKey,raw.slice(12));
   const url=URL.createObjectURL(new Blob([plain],{type:'image/webp'}));
   imageCache.set(path,url);return url;
 }catch(error){console.warn('warehouse_image_decrypt',error);return ''}
}
function isAdmin(){return !!currentToken}
function openLogin(){
 const dialog=document.getElementById('adminLogin');
 if(!dialog)return;
 dialog.querySelector('input[name="token"]').value='';
 dialog.querySelector('.login-error').textContent='';
 dialog.showModal();
}
function setup(){
 if(document.getElementById('adminBtn'))return;
 document.body.insertAdjacentHTML('beforeend',`
 <dialog id="adminLogin" class="form-dialog" style="max-width:510px;width:calc(100vw - 24px);padding:25px">
 <form method="dialog" id="adminForm">
 <div class="modal-top"><div><small>إدارة المخزون</small><h3>دخول المسؤول</h3></div><button type="button" class="close-btn" data-dismiss-admin aria-label="إغلاق">×</button></div>
 <p style="font-size:.86rem;color:#657b71;line-height:1.9">لإضافة وتعديل الأصناف للجميع، استخدم GitHub Fine-grained token خاص بمستودع <bdi>kmh2000/ivory-english</bdi> مع صلاحية Contents: Read and write. لا ترسل المفتاح لأي شخص؛ يُحفظ في هذه الجلسة فقط.</p>
 <label class="field wide"><span>رمز الإدارة (Token)</span><input name="token" type="password" autocomplete="off" required placeholder="github_pat_..." style="width:100%"></label>
 <p class="login-error" role="alert" style="color:#a13a30;font-size:.82rem"></p>
 <div class="form-actions"><button class="btn btn-secondary" type="button" data-dismiss-admin>إلغاء</button><button class="btn btn-primary" type="submit">دخول الإدارة</button></div>
 </form></dialog>`);
 const style=document.createElement('style');
 style.textContent='body:not(.warehouse-admin) .edit-action{display:none!important}';
 document.head.appendChild(style);
 const bar=document.querySelector('.top-actions'),button=document.createElement('button');
 button.id='adminBtn';button.className='btn btn-ghost';button.type='button';
 bar.insertBefore(button,bar.firstChild);
 const refresh=()=>{document.body.classList.toggle('warehouse-admin',!!currentToken);button.textContent=currentToken?'إدارة ✓':'دخول الإدارة'};
 refresh();
 button.addEventListener('click',()=>{if(currentToken){if(confirm('تسجيل الخروج من وضع الإدارة؟')){currentToken='';sessionStorage.removeItem(TOKEN_NAME);refresh()}}else openLogin()});
 const dialog=document.getElementById('adminLogin');
 dialog.querySelectorAll('[data-dismiss-admin]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
 dialog.querySelector('#adminForm').addEventListener('submit',async e=>{
   e.preventDefault();const candidate=e.currentTarget.elements.token.value.trim();
   const error=dialog.querySelector('.login-error');
   if(!/^((github_pat_|ghp_|ghu_)[A-Za-z0-9_]+)$/.test(candidate)){error.textContent='رمز GitHub غير صالح';return}
   const button=e.currentTarget.querySelector('[type="submit"]');button.disabled=true;
   try{
     const response=await fetch('https://api.github.com/repos/'+OWNER+'/'+REPO,{headers:{'Authorization':'Bearer '+candidate,'Accept':'application/vnd.github+json'}});
     if(!response.ok)throw Error('تعذر التحقق من الرمز وصلاحية المستودع ('+response.status+')');
     currentToken=candidate;sessionStorage.setItem(TOKEN_NAME,candidate);refresh();dialog.close();
   }catch(err){error.textContent=err?.message||'تعذر تسجيل الدخول'}finally{button.disabled=false}
 });
}
window.WAREHOUSE_SHARED={load,save,image,setup,isAdmin,openLogin};
})();
