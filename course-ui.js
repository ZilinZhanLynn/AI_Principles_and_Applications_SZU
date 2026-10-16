'use strict';
(() => {
  const n=Number(new URLSearchParams(location.search).get('n')||0);
  if(![3,11].includes(n)||!document.getElementById('overview'))return;
  document.body.classList.add('ui-prototype','ui-lesson-'+n);
  const by=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const scope=n===3?{
    core:'问题建模、状态与结点、搜索框架',practice:'一句 Prompt，建立任务起点',frontier:'搜索与大模型的联系'
  }:{
    core:'证据、检索与生成的分工',practice:'RAG 证据核验',frontier:'GraphRAG、Self-RAG、Agentic RAG'
  };
  const ribbon=document.createElement('div');ribbon.className='track-ribbon';ribbon.setAttribute('aria-label','本课三条学习线');
  ribbon.innerHTML=`<div class="track-core"><span>核心学习${n===3?' · 期末范围':' · 稳定原理'}</span><strong>${esc(scope.core)}</strong></div><div class="track-practice"><span>课堂实践 · 从任务到证据</span><strong>${esc(scope.practice)}</strong></div><div class="track-frontier"><span>前沿窗口 · 拓展不考</span><strong>${esc(scope.frontier)}</strong></div>`;
  const learning=by('overview').querySelector('.learning-box');learning.after(ribbon);

  const groups=n===3?{
    core:['search-why','warmup','search-foundations','interactive','classic-search-labs'],
    practice:['literature-lab','agent-prompt','activity'],
    frontier:['search-modern']
  }:{
    core:['warmup','rag-foundations','activity','faq'],
    practice:['rag-lab'],
    frontier:['rag-frontier']
  };

  if(n===3){
    by('faq')?.remove();
    by('literature-state-challenge')?.remove();
    const order=['search-why','warmup','search-foundations','interactive','classic-search-labs','literature-lab','agent-prompt','activity','search-modern','materials'];
    let anchor=by('overview');
    order.forEach(id=>{const node=by(id);if(!anchor||!node)return;anchor.after(node);anchor=node;});
  }
  const labels={core:['核心必学','先把原理和判断条件学清楚。'],practice:['课堂实践','用一个低负担操作把本课原理用于文献检索 Agent。'],frontier:['前沿窗口','了解当前技术正在怎样使用这些思想；拓展不考。']};
  Object.entries(groups).forEach(([track,ids])=>{
    const existing=ids.map(by).filter(Boolean);
    existing.forEach(section=>{section.classList.add('track-section','track-'+track);section.dataset.track=track;});
    const first=existing[0];if(!first)return;
    const marker=document.createElement('div');marker.className='track-marker track-marker-'+track;
    marker.innerHTML=`<span>${labels[track][0]}</span><p>${labels[track][1]}</p>`;
    first.before(marker);
  });

  const nav=by('main').querySelector('.lesson-nav nav');
  const menuGroups=n===3?[
    {label:'开始',tone:'start',items:[['overview','本课要点'],['warmup','先做预测']]},
    {label:'核心必学 · 期末范围',tone:'core',items:[['search-foundations','搜索基础'],['interactive','水罐与搜索'],['classic-search-labs','八数码与罗马尼亚']]},
    {label:'迁移实践',tone:'practice',items:[['literature-lab','写一句 Prompt'],['activity','本课任务']]} ,
    {label:'拓展与资料',tone:'frontier',items:[['search-modern','前沿窗口'],['materials','本课资料']]}
  ]:[
    {label:'开始',tone:'start',items:[['overview','本课要点'],['warmup','先想一想']]},
    {label:'稳定原理',tone:'core',items:[['rag-foundations','证据与生成']]},
    {label:'课堂实践',tone:'practice',items:[['rag-lab','RAG 沙盒'],['activity','完成与自查']]},
    {label:'拓展与资料',tone:'frontier',items:[['rag-frontier','前沿窗口'],['materials','课件与选读']]}
  ];
  const menu=menuGroups.flatMap(group=>group.items);
  nav.replaceChildren();
  nav.classList.add('lesson-menu-groups');
  menuGroups.forEach(group=>{
    const items=group.items.filter(([id])=>by(id));if(!items.length)return;
    const block=document.createElement('div');block.className=`lesson-menu-group menu-${group.tone}`;
    const title=document.createElement('p');title.className='lesson-menu-label';title.textContent=group.label;
    const links=document.createElement('div');links.className='lesson-menu-links';
    items.forEach(([id,label])=>{const a=document.createElement('a');a.href='#'+id;a.textContent=label;links.append(a);});
    block.append(title,links);nav.append(block);
  });

  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    nav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+visible.target.id));
  },{rootMargin:'-18% 0px -68% 0px',threshold:[0,.2,.6]});
  menu.forEach(([id])=>{const section=by(id);if(section)observer.observe(section);});

  const note=document.querySelector('.lesson-nav>.note');
  if(note)note.innerHTML='课堂个人完成。<br>当前页面自查不上传；前沿内容不进入期末笔试。';
})();
