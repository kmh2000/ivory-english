(function(){
"use strict";
const PRACTICE=[{"id":"p1","section":"تناظر لفظي","question":"سواك : أسنان","options":["مشط : شعر","مفتاح : بيت","ماء : نهر","ورقة : غصن"],"answer":0,"why":"أداة تُستعمل للعناية بشيء محدد.","priority":1},{"id":"p2","section":"تناظر لفظي","question":"مفتاح : قفل","options":["كلمة مرور : حساب","عين : نظر","خشب : باب","طبيب : مستشفى"],"answer":0,"why":"المفتاح يفتح القفل، وكلمة المرور تفتح الحساب.","priority":2},{"id":"p3","section":"تناظر لفظي","question":"مقص : قص","options":["قلم : كتابة","مصباح : كتاب","نافذة : هواء","باب : جدار"],"answer":0,"why":"أداة ثم وظيفتها.","priority":3},{"id":"p4","section":"تناظر لفظي","question":"نحلة : خلية","options":["طائر : عش","سائق : طريق","قط : طعام","شجرة : ورقة"],"answer":0,"why":"الكائن ثم مسكنه.","priority":3},{"id":"p5","section":"تناظر لفظي","question":"حرف : كلمة","options":["طوبة : جدار","سيارة : طريق","معلم : مدرسة","ثمرة : بستان"],"answer":0,"why":"جزء يتكوّن منه الكل.","priority":1},{"id":"p6","section":"تناظر لفظي","question":"بذرة : شجرة","options":["بيضة : طائر","مطر : غيم","شمس : قمر","كتاب : صفحة"],"answer":0,"why":"الأول ينمو حتى يصير الثاني.","priority":2},{"id":"p7","section":"تناظر لفظي","question":"صهيل : حصان","options":["مواء : قط","حفيف : طائرة","هطول : نار","سباحة : سمكة"],"answer":0,"why":"صوت يميّز حيوانًا.","priority":3},{"id":"p8","section":"تناظر لفظي","question":"سريع : بطيء","options":["حار : بارد","مسرور : سعيد","قوي : شديد","قريب : ملاصق"],"answer":0,"why":"تضاد في المعنى.","priority":3},{"id":"p9","section":"تناظر لفظي","question":"طبيب : مستشفى","options":["معلم : مدرسة","مريض : دواء","طالب : قلم","حديقة : شجرة"],"answer":0,"why":"مهنة ومكان عملها.","priority":1},{"id":"p10","section":"تناظر لفظي","question":"نار : حرارة","options":["مصباح : ضوء","مفتاح : قفل","شجرة : جذر","نافذة : غرفة"],"answer":0,"why":"مصدر ثم أثره.","priority":2},{"id":"p11","section":"خطأ سياقي","question":"غادر المسافر مبكرًا حتى يتأخر عن موعد الطائرة. ما الكلمة غير المناسبة؟","options":["غادر","مبكرًا","يتأخر","موعد"],"answer":2,"why":"الخروج مبكرًا لتجنّب التأخر.","priority":3},{"id":"p12","section":"خطأ سياقي","question":"أغلق الطبيب الجرح بعناية كي يزيد النزيف. ما الكلمة غير المناسبة؟","options":["أغلق","الجرح","بعناية","يزيد"],"answer":3,"why":"إغلاق الجرح يحدّ النزيف لا يزيده.","priority":3},{"id":"p13","section":"خطأ سياقي","question":"راجع الطالب دروسه جيدًا، فصار أكثر جهلًا بها. ما الكلمة غير المناسبة؟","options":["راجع","جيدًا","أكثر","جهلًا"],"answer":3,"why":"المراجعة تزيد المعرفة لا الجهل.","priority":1},{"id":"p14","section":"خطأ سياقي","question":"لأن المكتبة هادئة، رفع الزوار أصواتهم حفاظًا على الهدوء. ما الكلمة غير المناسبة؟","options":["هادئة","رفع","حفاظًا","الهدوء"],"answer":1,"why":"الهدوء يحتاج خفض الصوت.","priority":2},{"id":"p15","section":"خطأ سياقي","question":"أثنى المدير على تعاون الفريق ووصفه بأنه أناني. ما الكلمة غير المناسبة؟","options":["أثنى","تعاون","الفريق","أناني"],"answer":3,"why":"الأنانية تناقض التعاون.","priority":3},{"id":"p16","section":"خطأ سياقي","question":"أُطفئت الأنوار فأصبحت الغرفة أكثر إشراقًا. ما الكلمة غير المناسبة؟","options":["أُطفئت","الأنوار","أصبحت","إشراقًا"],"answer":3,"why":"إطفاء الأنوار يقلّل الإضاءة.","priority":3},{"id":"p17","section":"خطأ سياقي","question":"ارتدى الرجل معطفًا ثقيلًا اتقاءً لشدة الحر. ما الكلمة غير المناسبة؟","options":["ارتدى","معطفًا","ثقيلًا","الحر"],"answer":3,"why":"المعطف الثقيل يناسب البرد لا الحر.","priority":1},{"id":"p18","section":"خطأ سياقي","question":"حرصت المدرسة على السلامة فأغلقت مخارج الطوارئ نهائيًا. ما الكلمة غير المناسبة؟","options":["حرصت","السلامة","أغلقت","الطوارئ"],"answer":2,"why":"السلامة تقتضي إبقاء مخارج الطوارئ متاحة.","priority":2},{"id":"p19","section":"إكمال الجمل","question":"القراءة تُوسّع _____ الإنسان وتزيد من _____.","options":["مدارك — معرفته","نوم — تعبه","خطأ — جهله","حدود — صمته"],"answer":0,"why":"القراءة تزيد الفهم والمعرفة.","priority":3},{"id":"p20","section":"إكمال الجمل","question":"لا يتحقق النجاح إلا بـ_____ والعمل _____.","options":["الصبر — المستمر","التردد — القليل","الإهمال — المؤجل","التكاسل — البطيء"],"answer":0,"why":"الإنجاز يحتاج صبرًا وعملًا.","priority":3},{"id":"p21","section":"إكمال الجمل","question":"الوقت مورد _____؛ فلا ينبغي _____.","options":["ثمين — إضاعته","قديم — حفظه","واسع — تنظيمه","غريب — استثماره"],"answer":0,"why":"لأن الوقت ثمين ينبغي الحفاظ عليه.","priority":1},{"id":"p22","section":"إكمال الجمل","question":"ينجح العمل الجماعي عندما يتبادل الأفراد _____ ويحترمون _____.","options":["الأفكار — الآراء","الأخطاء — الرفض","الخصومات — الضجيج","الأوامر — الإهمال"],"answer":0,"why":"التعاون يبدأ بتبادل الأفكار واحترام الآخرين.","priority":2},{"id":"p23","section":"إكمال الجمل","question":"التفاؤل لا يعني تجاهل _____، بل محاولة _____.","options":["الصعوبات — تجاوزها","النجاح — خسارته","الفرح — إخفائه","المعرفة — نسيانها"],"answer":0,"why":"المتفائل يواجه الصعوبات.","priority":3},{"id":"p24","section":"إكمال الجمل","question":"إذا أردت إقناع غيرك فابدأ بـ_____ حجته قبل أن _____ عليها.","options":["فهم — ترد","رفض — توافق","إخفاء — تبحث","تكرار — تنسى"],"answer":0,"why":"الرد الجيد يبدأ بالفهم.","priority":3},{"id":"p25","section":"إكمال الجمل","question":"يتعلم الطالب من أخطائه عندما _____ أسبابها ثم _____ أداءه.","options":["يحلل — يحسن","يخفي — يضعف","يتجاهل — يهمل","ينسى — يكرر"],"answer":0,"why":"التحليل ثم التحسين.","priority":1},{"id":"p26","section":"إكمال الجمل","question":"المعرفة من دون تطبيق كالشجرة من دون _____.","options":["ثمر","ظل","جذع","تراب"],"answer":0,"why":"التطبيق ثمرة المعرفة.","priority":2},{"id":"p27","section":"استيعاب المقروء","question":"القطعة: «تخصّص هدى نصف ساعة يوميًا للقراءة، ثم تكتب سطرين عن كل كتاب. لاحظت بعد شهر أنها تتذكر الأفكار بسهولة أكبر». ما الذي ساعد هدى على التذكر؟","options":["القراءة والتلخيص المنتظمان","قراءة العناوين فقط","تأجيل التلخيص","الاعتماد على الحفظ دون مراجعة"],"answer":0,"why":"القطعة ذكرت القراءة ثم كتابة الملخص.","priority":3},{"id":"p28","section":"استيعاب المقروء","question":"القطعة: «بعد أن زادت البلدية الحافلات بين الأحياء، قل استخدام السيارات الخاصة في الرحلات القصيرة». ما النتيجة المذكورة؟","options":["انخفاض استخدام السيارات الخاصة","إغلاق الطرق","ارتفاع عدد السيارات","نقص الحافلات"],"answer":0,"why":"النص صرّح بانخفاض استخدام السيارات.","priority":3},{"id":"p29","section":"استيعاب المقروء","question":"القطعة: «يحتاج النبات إلى ضوء كافٍ وماء مناسب. وقد تتضرر جذوره إذا غُمِرت بالماء باستمرار». ماذا نستنتج؟","options":["الإفراط في الري قد يضر النبات","كل النباتات تعيش بلا ضوء","الماء الكثير مفيد دائمًا","الضوء ليس ضروريًا"],"answer":0,"why":"النص يحذّر من غمر الجذور دائمًا.","priority":1},{"id":"p30","section":"استيعاب المقروء","question":"القطعة: «فتحت المكتبة أبوابها في المساء لمساعدة الموظفين الذين يصعب عليهم زيارتها نهارًا». لماذا أضيفت ساعات المساء؟","options":["لتناسب مواعيد الموظفين","لإلغاء الفترة الصباحية","لتقليل عدد الكتب","لمنع الطلاب من الزيارة"],"answer":0,"why":"السبب مذكور صراحةً في النص.","priority":2},{"id":"p31","section":"استيعاب المقروء","question":"القطعة: «كانت سارة تتوقف عند كل كلمة جديدة، تبحث عن معناها ثم تكتب مثالًا من عندها». ما أسلوب سارة في التعلم؟","options":["فهم الكلمة ثم توظيفها","تجاوز الكلمات الصعبة","حفظ الكلمات دون فهم","نسخ القصة كاملة"],"answer":0,"why":"البحث عن المعنى ثم المثال يدل على التوظيف.","priority":3},{"id":"p32","section":"استيعاب المقروء","question":"القطعة: «لاحظ المتطوعون أن الأشجار الصغيرة تحتاج رعاية أكثر في الصيف، فوضعوا جدولًا أسبوعيًا للري». لماذا أنشأوا الجدول؟","options":["لتنظيم ري الأشجار","لتقليل عدد المتطوعين","لإيقاف الزراعة","لخفض ضوء الشمس"],"answer":0,"why":"هدف الجدول تنظيم الرعاية والري.","priority":3}];
const ASSESSMENT=[{"id":"d1","section":"تناظر لفظي","question":"مِشرط : جراحة","options":["فرشاة : رسم","حبر : صحيفة","مستشفى : طبيب","غرفة : باب"],"answer":0,"why":"كل أداة تُستخدم في عمل محدد.","priority":1},{"id":"d2","section":"خطأ سياقي","question":"ساعد المطر الغزير على جفاف التربة. ما الكلمة غير المناسبة؟","options":["ساعد","المطر","الغزير","جفاف"],"answer":3,"why":"المطر الغزير يزيد البلل لا الجفاف.","priority":2},{"id":"d3","section":"إكمال الجمل","question":"التعلّم المستمر _____ الخبرة ويُوسّع _____.","options":["يزيد — المعرفة","يقلّل — الفهم","يخفي — التجربة","ينهي — المحاولة"],"answer":0,"why":"التعلم يراكم الخبرة والمعرفة.","priority":3},{"id":"d4","section":"استيعاب المقروء","question":"القطعة: «زرع ناصر بذرتين، وضع الأولى في ضوء الشمس والثانية في خزانة مظلمة، وسقاهما بالمقدار نفسه. نمت الأولى أسرع». ما العامل الذي اختلف؟","options":["الضوء","الماء","عدد البذور","نوع التربة المذكور"],"answer":0,"why":"النص ثبّت الماء وغيّر الضوء.","priority":3},{"id":"d5","section":"تناظر لفظي","question":"طوبة : جدار","options":["كلمة : جملة","طبيب : عيادة","مفتاح : باب","ضوء : شمس"],"answer":0,"why":"الطوبة جزء من الجدار والكلمة من الجملة.","priority":1},{"id":"d6","section":"خطأ سياقي","question":"حرصت المدرسة على سلامة الطلاب، لذلك ألغت جميع مخارج الطوارئ. ما الكلمة غير المناسبة؟","options":["حرصت","سلامة","ألغت","الطلاب"],"answer":2,"why":"السلامة تستلزم مخارج طوارئ متاحة.","priority":2},{"id":"d7","section":"إكمال الجمل","question":"في الحوار الجيد ينبغي أن _____ للآخر قبل أن _____ عليه.","options":["تنصت — ترد","تقاطع — توافق","تصرخ — تستمع","تغفل — تسأل"],"answer":0,"why":"الفهم يسبق الرد.","priority":3},{"id":"d8","section":"استيعاب المقروء","question":"القطعة: «أضاف المقهى مشروبات خالية من السكر بعد أن طلبها عدد من الزبائن». ما سبب الإضافة؟","options":["طلبات الزبائن","انخفاض الإيجار","تغيير الأثاث","إغلاق المقهى"],"answer":0,"why":"السبب المباشر هو طلب الزبائن.","priority":3},{"id":"d9","section":"تناظر لفظي","question":"تفاحة : فاكهة","options":["وردة : زهرة","غصن : شجرة","سائق : طريق","كتاب : مكتبة"],"answer":0,"why":"كل كلمة أولى نوع من الثانية.","priority":1},{"id":"d10","section":"خطأ سياقي","question":"كلما تدرب العازف أكثر أصبحت مهارته أضعف، مع أن أداءه تحسّن باستمرار. ما الكلمة غير المناسبة؟","options":["تدرب","أكثر","أضعف","تحسّن"],"answer":2,"why":"تحسن الأداء يناقض وصف المهارة بالضعف.","priority":2},{"id":"d11","section":"إكمال الجمل","question":"عندما تكون التعليمات _____ تقل الأخطاء وتزداد _____.","options":["واضحة — الدقة","غامضة — الفوضى","متناقضة — الحيرة","مجهولة — المشكلات"],"answer":0,"why":"وضوح التعليمات يرفع الدقة.","priority":3},{"id":"d12","section":"استيعاب المقروء","question":"القطعة: «كان أحمد يختبر إجاباته بعد المذاكرة، ثم يعيد حل الأسئلة التي أخطأ فيها». ما الهدف من إعادة الحل؟","options":["معالجة نقاط الضعف","زيادة عدد الكتب","تجاهل الأخطاء","تأجيل المراجعة"],"answer":0,"why":"يعيد حل أخطائه لتصحيح الفهم.","priority":3},{"id":"d13","section":"تناظر لفظي","question":"شجرة : ظل","options":["مدفأة : دفء","معلم : مدرسة","إبرة : خيط","باب : منزل"],"answer":0,"why":"الأولى مصدر لأثر في الثانية.","priority":1},{"id":"d14","section":"خطأ سياقي","question":"أشاد المسؤول بدقة التقرير ثم قال إنه مليء بالمعلومات العشوائية التي لم تُراجع. ما الكلمة التي تناقض الدقة؟","options":["أشاد","دقة","التقرير","العشوائية"],"answer":3,"why":"الدقة تناقض المعلومات العشوائية.","priority":2},{"id":"d15","section":"إكمال الجمل","question":"من يحافظ على وقته يستطيع _____ أعماله دون _____.","options":["إنجاز — تأخير","نسيان — انتظام","تعطيل — تخطيط","ترك — فائدة"],"answer":0,"why":"تنظيم الوقت يساعد الإنجاز بلا تأخير.","priority":3},{"id":"d16","section":"استيعاب المقروء","question":"القطعة: «جهزت مريم حقيبتها من الليل، فلم تضطر إلى البحث عن أدواتها صباحًا». ما فائدة التجهيز المسبق؟","options":["توفير الوقت صباحًا","زيادة عدد الأدوات","تأخير الخروج","نسيان الحقيبة"],"answer":0,"why":"التجهيز منع البحث صباحًا.","priority":3},{"id":"d17","section":"تناظر لفظي","question":"سائق : سيارة","options":["طيار : طائرة","ممرضة : كتاب","رسام : حديقة","مزارع : مدينة"],"answer":0,"why":"الشخص ووسيلة النقل التي يقودها.","priority":1},{"id":"d18","section":"خطأ سياقي","question":"أراد الباحث التأكد من النتائج، فتجاهل جميع القياسات وأصدر حكمه فورًا. ما الكلمة غير المناسبة؟","options":["الباحث","التأكد","تجاهل","النتائج"],"answer":2,"why":"التأكد يحتاج فحص القياسات لا تجاهلها.","priority":2},{"id":"d19","section":"إكمال الجمل","question":"تحتاج الموهبة إلى _____ مستمر حتى تتحول إلى _____.","options":["تدريب — مهارة","إهمال — نجاح","توقف — خبرة","نسيان — إتقان"],"answer":0,"why":"التدريب يصقل الموهبة.","priority":3},{"id":"d20","section":"استيعاب المقروء","question":"القطعة: «أعلنت الحديقة منع رمي المخلفات، ووضعت حاويات إضافية عند المداخل». ما الغاية الأوضح؟","options":["المحافظة على نظافة الحديقة","تقليل عدد الأشجار","إلغاء الزيارات","إغلاق المداخل"],"answer":0,"why":"المنع والحاويات يخدمان النظافة.","priority":3}];
// Keep answer locations varied so the diagnostic cannot be guessed by position.
for(const q of PRACTICE.concat(ASSESSMENT)){
 const size=q.options.length,steps=(Number(q.id.slice(1))*3+1)%size;
 if(steps){q.options=q.options.slice(-steps).concat(q.options.slice(0,-steps));q.answer=(q.answer+steps)%size;}
}
const CATS=["تناظر لفظي","خطأ سياقي","إكمال الجمل","استيعاب المقروء"];
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Number(n).toLocaleString("ar-SA");
const pkey="ivory.verbal.breaks.v1",tkey="ivory.verbal.assessment.v1";
function load(key,initial){try{const x=JSON.parse(localStorage.getItem(key)||"null");if(x&&typeof x==="object")return x}catch(e){}return initial}
function store(key,obj){try{localStorage.setItem(key,JSON.stringify(obj))}catch(e){}}
const state=load(pkey,{answers:{},round:0,index:0});
const assessment=load(tkey,{answers:{},index:0,finished:false});
if(!state.answers||typeof state.answers!=="object")state.answers={};
if(!assessment.answers||typeof assessment.answers!=="object")assessment.answers={};
const order=[];
for(let i=0;i<10;i++)for(const c of CATS){const a=PRACTICE.filter(q=>q.section===c);if(a[i])order.push(a[i])}
const rounds=[];
for(let i=0;i<order.length;i+=5)rounds.push(order.slice(i,i+5));
let view="reader",reveal=false;
function answerButtons(q,chosen,show,kind){
 const letters=["أ","ب","ج","د"];
 return '<div class="choices">'+q.options.map((opt,i)=>{
  const c=show?(i===q.answer?"correct":i===chosen?"wrong":""):"";
  return '<button type="button" class="choice '+c+'" '+(show||kind==="test"&&chosen!==undefined?'disabled':'')+' data-'+kind+'-choice="'+i+'"><span class="letter">'+letters[i]+'</span><span>'+esc(opt)+'</span></button>';
 }).join("")+'</div>';
}
function feedback(q,pick){
 return '<div class="feedback '+(pick===q.answer?"ok":"no")+'"><strong>'+(pick===q.answer?'✓ صحيح':'✕ غير صحيح')+'</strong>الإجابة: '+esc(q.options[q.answer])+'<div class="quickwhy">ليش؟ '+esc(q.why)+'</div></div>';
}
function navigateTab(x){
 view=x;
 $("#allReader").hidden=x!=="reader";
 $$(".stats,.meter,.layout").forEach(el=>el.hidden=x!=="quiz");
 $("#breakSection").hidden=x!=="breaks";$("#testSection").hidden=x!=="test";
 [["tabReader","reader"],["tabQuiz","quiz"],["tabBreaks","breaks"],["tabTest","test"]].forEach(([id,v])=>{let el=$("#"+id);if(el){el.classList.toggle("selected",v===x);el.setAttribute("aria-selected",String(v===x))}});
 try{localStorage.setItem("ivory.verbal.openTab.v1",x)}catch(e){}
 if(x==="reader"){$("#readerSection").dispatchEvent(new Event("change"))}
 if(x==="breaks")renderBreak();
 if(x==="test")renderTest();
}
function startBreak(index){
 state.round=((index%rounds.length)+rounds.length)%rounds.length;state.index=0;store(pkey,state);renderBreak();
}
function renderBreak(){
 const n=Number.isInteger(state.round)?Math.max(0,Math.min(rounds.length-1,state.round)):0;
 const a=rounds[n],i=Math.max(0,Math.min(a.length-1,Number(state.index)||0)),q=a[i];
 const completed=a.filter(x=>Object.prototype.hasOwnProperty.call(state.answers,x.id));
 const right=completed.filter(x=>state.answers[x.id]===x.answer);
 const box=$("#breakContent"),done=Object.prototype.hasOwnProperty.call(state.answers,q.id),pick=state.answers[q.id];
 $("#breakTitle").textContent="بريك "+fmt(n+1)+" من "+fmt(rounds.length)+" · "+fmt(a.length)+" أسئلة";
 $("#breakProgress").textContent=fmt(completed.length)+" / "+fmt(a.length)+" محلولة";
 $("#breakMeter").style.width=(100*completed.length/a.length)+"%";
 let atEnd=completed.length===a.length && i===a.length-1 && done;
 box.innerHTML='<div class="qhead"><div class="tags"><span class="tag">'+esc(q.section)+'</span><span class="tag '+(q.priority===1?"urgent":q.priority===2?"medium":"normal")+'">'+(q.priority===1?"مهم جدًا":q.priority===2?"مهم":"عادي")+'</span></div><span class="mini">السؤال '+fmt(i+1)+' من '+fmt(a.length)+'</span></div><div class="qbody"><h2 class="qtitle">'+esc(q.question)+'</h2>'+answerButtons(q,pick,done,"practice")+(done?feedback(q,pick):'')+'</div><div class="footq"><div class="buttons"><button type="button" class="btn" id="breakPrev" '+(i===0?"disabled":"")+'>السابق</button><button type="button" class="btn primary" id="breakNext" '+(!done||i===a.length-1?"disabled":"")+'>التالي</button></div><button type="button" class="btn" id="breakReset">أعد هذا البريك</button></div>'+(atEnd?'<div class="breakdone"><strong>نتيجة البريك: '+fmt(right.length)+' من '+fmt(a.length)+'</strong><span>الشرح المختصر ظهر بعد كل سؤال.</span><button type="button" class="btn primary" id="nextBreak">ابدأ البريك التالي</button></div>':'');
 $$('[data-practice-choice]').forEach(el=>el.onclick=()=>{if(done)return;state.answers[q.id]=Number(el.dataset.practiceChoice);store(pkey,state);renderBreak()});
 $("#breakPrev").onclick=()=>{state.index=Math.max(0,i-1);store(pkey,state);renderBreak()};
 $("#breakNext").onclick=()=>{state.index=Math.min(a.length-1,i+1);store(pkey,state);renderBreak()};
 $("#breakReset").onclick=()=>{a.forEach(q=>delete state.answers[q.id]);state.index=0;store(pkey,state);renderBreak()};
 if(atEnd)$("#nextBreak").onclick=()=>startBreak(n+1);
 $("#breakPicker").innerHTML=rounds.map((a,j)=>'<button class="page-mini '+(j===n?'selected':'')+' '+(a.every(x=>Object.prototype.hasOwnProperty.call(state.answers,x.id))?'done':'')+'" data-round="'+j+'">'+fmt(j+1)+'</button>').join("");
 $$("[data-round]").forEach(el=>el.onclick=()=>startBreak(Number(el.dataset.round)));
}
function rating(percent){return percent>=85?["ممتاز","فهمك قوي؛ واصل بأسئلة أصعب."]:percent>=70?["جيد","مستواك جيد؛ راجع الأقسام الأقل درجة."]:percent>=50?["متوسط","تحتاج تثبيت العلاقات والسياق مع البريكات."]:["يحتاج تقوية","ابدأ ببريك قصير وراجع سبب كل إجابة."]}
function renderResult(){
 const correct=ASSESSMENT.filter(q=>Number(assessment.answers[q.id])===q.answer);
 const pct=Math.round(correct.length/ASSESSMENT.length*100),badge=rating(pct);
 const breakdown=CATS.map(c=>{
 const set=ASSESSMENT.filter(q=>q.section===c),count=set.filter(q=>Number(assessment.answers[q.id])===q.answer).length;
 return {c,n:count,total:set.length};
 }).sort((a,b)=>a.n-b.n);
 let weakest=breakdown.filter(q=>q.n<q.total);
 $("#testContent").innerHTML='<div class="assess-result"><div class="eyebrow">YOUR VERBAL LEVEL</div><h2>نتيجتك: '+fmt(pct)+'٪</h2><p class="assess-level">'+badge[0]+'</p><p>'+badge[1]+'</p><div class="result-grid">'+breakdown.map(x=>'<div class="result-item"><strong>'+esc(x.c)+'</strong><b>'+fmt(x.n)+' / '+fmt(x.total)+'</b></div>').join("")+'</div>'+(weakest.length?'<p class="tipline">ابدأ بمراجعة: '+esc(weakest[0].c)+' (الأقل درجة).</p>':'<p class="tipline">أداء متوازن في الأقسام الأربعة.</p>')+'<p class="note">هذا تقييم تدريبي تقريبي للفهم، وليس درجة قياس الرسمية.</p><button type="button" class="btn primary" id="testAgain">أعد الاختبار</button><button type="button" class="btn" id="testReview" aria-expanded="'+reveal+'">راجع الشرح المختصر</button><button type="button" class="btn" id="toBreaks">تدرّب ٥ أسئلة</button><div id="reviewWrap"></div></div>';
 $("#testAgain").onclick=()=>{assessment.answers={};assessment.index=0;assessment.finished=false;reveal=false;store(tkey,assessment);renderTest()};
 $("#testReview").onclick=()=>{reveal=!reveal;renderResult()};
 $("#toBreaks").onclick=()=>navigateTab("breaks");
 if(reveal){
 $("#reviewWrap").innerHTML='<div class="review-list">'+ASSESSMENT.map((q,i)=>{
 let ans=Number(assessment.answers[q.id]),ok=ans===q.answer;
 return '<div class="review-row"><span class="'+(ok?'review-ok':'review-bad')+'">'+(ok?'✓':'✕')+'</span><strong>'+fmt(i+1)+'. '+esc(q.question)+'</strong><p>الصحيح: '+esc(q.options[q.answer])+' — '+esc(q.why)+'</p></div>';
 }).join("")+'</div>';
 }
}
function renderTest(){
 const total=ASSESSMENT.length;
 let answered=ASSESSMENT.filter(q=>Object.prototype.hasOwnProperty.call(assessment.answers,q.id)).length;
 if(assessment.finished||answered===total){assessment.finished=true;store(tkey,assessment);$("#testStatus").textContent="اكتمل الاختبار";$("#testMeter").style.width="100%";renderResult();return}
 let i=Math.max(0,Math.min(total-1,Number(assessment.index)||0));
 if(Object.prototype.hasOwnProperty.call(assessment.answers,ASSESSMENT[i].id)){
 const u=ASSESSMENT.findIndex(q=>!Object.prototype.hasOwnProperty.call(assessment.answers,q.id));if(u>=0){i=u;assessment.index=i}
 }
 const q=ASSESSMENT[i];
 $("#testStatus").textContent=fmt(answered)+" من "+fmt(total)+" إجابة";
 $("#testMeter").style.width=(100*answered/total)+"%";
 const el=$("#testContent");
 el.innerHTML='<div class="qhead"><span class="tag">'+esc(q.section)+'</span><span class="mini">السؤال '+fmt(i+1)+' من '+fmt(total)+'</span></div><div class="qbody"><h2 class="qtitle">'+esc(q.question)+'</h2>'+answerButtons(q,undefined,false,"test")+'<p class="note">بدون كشف الإجابة أثناء الاختبار، عشان نقيس فهمك بشكل أقرب للواقع.</p></div>';
 $$('[data-test-choice]').forEach(b=>b.onclick=()=>{
 if(Object.prototype.hasOwnProperty.call(assessment.answers,q.id))return;
 assessment.answers[q.id]=Number(b.dataset.testChoice);
 assessment.index=i+1;
 if(Object.keys(assessment.answers).length===total)assessment.finished=true;
 store(tkey,assessment);renderTest();
 });
}
$("#tabBreaks").onclick=()=>navigateTab("breaks");
$("#tabTest").onclick=()=>navigateTab("test");
$("#tabQuiz").onclick=()=>navigateTab("quiz");
$("#tabReader").onclick=()=>navigateTab("reader");
$("#startBreak").onclick=()=>startBreak(state.round||0);

$("#practiceSimilar").onclick=()=>{
 const qid=Object.keys(load("ivory.verbal.progress.v1",{answers:{},saved:{}}).answers||{}).slice(-1)[0];
 const orig=JSON.parse($("#bank").textContent).find(q=>String(q.id)===String(qid));
 const sec=orig?.section||"تناظر لفظي";
 const isPending=q=>q.section===sec&&!Object.prototype.hasOwnProperty.call(state.answers,q.id);
 let wanted=rounds.findIndex(a=>a.some(isPending));
 if(wanted<0)wanted=rounds.findIndex(a=>a.some(q=>q.section===sec));
 if(wanted>=0){state.round=wanted;state.index=Math.max(0,rounds[wanted].findIndex(isPending));}
 store(pkey,state);navigateTab("breaks");
};
let tab="reader";try{tab=localStorage.getItem("ivory.verbal.openTab.v1")||"reader"}catch(e){}
navigateTab(["reader","quiz","breaks","test"].includes(tab)?tab:"reader");
})();
