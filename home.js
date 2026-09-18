'use strict';
const {lessons,modules}=window.CourseData;
const list=document.getElementById('course-list');
const moduleNotes=[
 '认识智能体、任务环境，以及如何把现实任务写成可求解的问题。',
 '从队列和栈出发，比较无信息搜索、代价搜索与启发式搜索。',
 '用 Minimax 和 Alpha-Beta 理解决策中的对手、边界与剪枝。',
 '把搜索中的状态、行动和目标连接到大模型、工具与 Agent。'
];
modules.forEach((name,i)=>{
 const section=document.createElement('section');section.id=`module-${i+1}`;
 const heading=document.createElement('h3');heading.className='module-heading';heading.textContent=`0${i+1} / ${name}`;section.append(heading);
 const note=document.createElement('p');note.className='module-note';note.textContent=moduleNotes[i];section.append(note);
 lessons.filter(l=>l.module===i).forEach(l=>{
 const row=document.createElement('a');row.className='course-row';row.href=`lesson.html?n=${l.n}`;
 const n=document.createElement('span');n.className='lesson-number';n.textContent=String(l.n).padStart(2,'0');
 const content=document.createElement('div'),h=document.createElement('h4'),p=document.createElement('p');h.textContent=l.title;p.textContent=l.goals[0];content.append(h,p);
 const tag=document.createElement('span');tag.className='tag';tag.textContent=l.tag+' ↗';row.append(n,content,tag);section.append(row);
 });list.append(section);
});
