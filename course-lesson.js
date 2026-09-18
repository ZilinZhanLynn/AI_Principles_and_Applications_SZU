'use strict';
const requested=new URLSearchParams(location.search).get('n')||'1';
const lesson=window.CourseData.lessons.find(l=>String(l.n)===requested);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=document.getElementById('lesson-content');
if(!lesson){root.innerHTML='<h1>没有这个课次</h1><p>请选择课程目录中的课次。</p><a class="button" href="index.html#schedule">返回课程目录</a>';}
else {
 const l=lesson,t=l.task;
 const widgetHTML=l.n===3?CourseWidgets.jug:[8,9].includes(l.n)?CourseWidgets.game:'';
 const widgetNav=document.getElementById('widget-nav');widgetNav.hidden=!widgetHTML;

 document.title=`${String(l.n).padStart(2,'0')} · ${l.title} | 人工智能原理与应用`;
 document.getElementById('lesson-number').textContent=`LESSON ${String(l.n).padStart(2,'0')}`;
 const source=l.source?`<a class="button secondary" href="assets/lecture-${String(l.source).padStart(2,'0')}.pdf" target="_blank" rel="noopener">打开对应课件 PDF ↗</a><p class="muted">课件 ${String(l.source).padStart(2,'0')}${l.pages?' · PDF 页码 '+esc(l.pages):''}。</p>`:`<p>${l.n===14?'回顾本课程中你使用过的一个模型、算法或互动结果。':'完成本课任务后，回顾操作过程和核验结果。'}</p><a class="text-link" href="index.html#schedule">返回课次列表 →</a>`;
 root.innerHTML=`<section id="overview" class="lesson-intro"><p class="eyebrow">${esc(window.CourseData.modules[l.module])}</p><h1>${esc(l.title)}</h1><div class="lesson-tags"><span>第 ${l.n} 次课</span><span>${esc(l.tag)}</span></div><div class="learning-box"><h2>今天学会什么？</h2><p class="lesson-promise">${esc(l.goals[0])}</p></div><div class="timing">${l.periods.map((p,i)=>`<span><b>学习步骤 ${i+1}</b>${esc(p)}</span>`).join('')}</div><p class="note">学习范围：${esc(l.scope)}</p></section>
 <section id="warmup" class="lesson-section"><p class="eyebrow">课前热身</p><h2>先想一想。</h2><p>${esc(l.warm)}</p></section>
 <section id="activity" class="lesson-section"><p class="eyebrow">个人课堂任务</p><h2>${esc(t.title)}</h2><div class="activity-flow"><span>① 先尝试</span><span>② 按需提示</span><span>③ 核对依据</span><span>④ 继续挑战</span></div><p class="task-prompt">${esc(t.prompt)}</p><div class="completion"><h3>做到什么算完成？</h3><p>${esc(t.done)}</p></div>${widgetHTML?'<a class="button secondary" href="#interactive">查看本课互动 ↓</a>':''}<label class="scratch-label" for="scratch">我的判断与依据 <span>（临时记录，刷新后清空）</span></label><textarea id="scratch" rows="4" placeholder="先记录你的答案；核对后补一句：哪一步需要修正，为什么？"></textarea><details class="support"><summary>需要帮助？展开一步提示</summary><p>${esc(t.hint)}</p></details><details class="support"><summary>我已尝试，查看自查解释</summary><p>${esc(t.answer)}</p></details><details class="support"><summary>提前完成？继续挑战</summary><p>${esc(t.challenge)}</p></details>${l.startCheck?startCheck():''}</section>
 ${widgetHTML?`<div id="interactive" class="lesson-widgets">${widgetHTML}</div>`:''}
 <section id="faq" class="lesson-section"><p class="eyebrow">常见疑问</p><h2>${esc(l.faq[0])}</h2><p>${esc(l.faq[1])}</p></section>
 <section id="materials" class="lesson-section"><p class="eyebrow">课件与拓展</p><h2>课内回顾，课外选读。</h2><div class="source-block">${source}</div><details class="support"><summary>课后拓展 · 自愿选做，无需提交</summary><p>${esc(l.extra)}</p></details><div class="lesson-pagination">${l.n>1?`<a href="lesson.html?n=${l.n-1}">← 第 ${l.n-1} 课</a>`:'<a href="index.html">← 课程首页</a>'}${l.n<14?`<a href="lesson.html?n=${l.n+1}">第 ${l.n+1} 课 →</a>`:'<a href="index.html#schedule">返回课程目录 →</a>'}</div></section>`;
 if(l.n===3)window.initializeJug();
 if([8,9].includes(l.n)){
  if(l.n===8)document.querySelector('[data-game="alphabeta"]').remove();
  window.initializeSearchWidgets(l.n===8?10:11);
 }
 if(widgetHTML&&location.hash==='#interactive')requestAnimationFrame(()=>document.getElementById('interactive').scrollIntoView());
 const check=document.getElementById('start-check');
 if(check)check.addEventListener('submit',event=>{event.preventDefault();const values=new FormData(check);let messages=[];if(values.get('alg')==='new')messages.push('算法：先使用边界表提示，再独立计算一次。');if(values.get('ai')==='new')messages.push('AI：先用熟悉的短材料完成一次摘要与逐项核对。');if(values.get('code')==='new')messages.push('编程：先完成网页中的基础操作，无需先安装开发工具。');document.getElementById('check-result').textContent=messages.length?messages.join(' '):'可以先独立完成每课任务，再尝试挑战题；仍需写清核验依据。';});
}
function startCheck(){return `<form id="start-check" class="start-check"><h3>3 分钟学习起点自查</h3><p class="muted">仅给出本页学习建议，不保存、不上传，也不用于分班。</p>${[['alg','算法','还不熟悉队列、栈等概念','能跟踪简单算法的步骤'],['ai','AI 使用','主要是简单聊天','做过材料整理并核对结果'],['code','编程','尚不能独立修改小程序','能运行并修改简单程序']].map(([name,label,a,b])=>`<fieldset><legend>${label}</legend><label><input type="radio" name="${name}" value="new" required> ${a}</label><label><input type="radio" name="${name}" value="ready"> ${b}</label></fieldset>`).join('')}<button class="button secondary" type="submit">查看学习建议</button><p id="check-result" role="status" aria-live="polite"></p></form>`;}
