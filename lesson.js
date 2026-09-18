window.initializeJug = function(){
'use strict';
const $=id=>document.getElementById(id);
let moves=[];
const state=()=>moves.length?moves[moves.length-1].state:[0,0];
const format=s=>`(${s[0]}, ${s[1]})`;
function render(message) {
  const s=state(), n=moves.length;
  $('water-a').style.height=`${s[0]/3*100}%`;
  $('water-b').style.height=`${s[1]/4*100}%`;
  $('amount-a').innerHTML=`${s[0]}<span> / 3 L</span>`;
  $('amount-b').innerHTML=`${s[1]}<span> / 4 L</span>`;
  $('state-value').textContent=format(s);
  $('step-count').textContent=`已操作 ${n} 步`;
  $('history-count').textContent=`（${n} 步）`;
  $('undo').disabled=n===0;
  document.querySelectorAll('[data-action]').forEach(button=>button.disabled=Jug.equal(s,Jug.transition(s,button.dataset.action)));
  $('lab-status').textContent=Jug.isGoal(s)?`成功！B 罐恰好有 2 L 水，你用了 ${n} 步。想一想：还能用更少的步骤吗？`:(message||'从 (0, 0) 开始。你想先装满哪个水罐？');
  $('lab-status').classList.toggle('success',Jug.isGoal(s));
  $('hint-text').hidden=true;
  $('history').replaceChildren();
  const first=document.createElement('li');first.textContent='初始状态 → (0, 0)';$('history').append(first);
  moves.forEach(move=>{const li=document.createElement('li');li.textContent=`${Jug.labels[move.action]} → ${format(move.state)}`;$('history').append(li);});
  document.dispatchEvent(new CustomEvent('jug:change',{detail:{state:[...s],parent:n?[...(n>1?moves[n-2].state:[0,0])]:null,action:n?moves[n-1].action:null,depth:n,cost:n}}));
}
document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{
  const action=button.dataset.action,next=Jug.transition(state(),action);
  if(Jug.equal(next,state()))return;
  moves.push({action,state:next});render(`${Jug.labels[action]}，现在是 ${format(next)}。下一步呢？`);
}));
$('undo').addEventListener('click',()=>{moves.pop();render(`已撤销一步，回到 ${format(state())}。`);});
$('reset').addEventListener('click',()=>{moves=[];render();});
$('hint').addEventListener('click',()=>{
  const path=Jug.shortestPath(state());
  $('hint-text').textContent=path.length?`从当前状态出发，最少还需 ${path.length} 步。下一步可以“${Jug.labels[path[0]]}”，将到达 ${format(Jug.transition(state(),path[0]))}。提示不会自动执行动作。`:'你已经达到目标，不需要继续操作。';
  $('hint-text').hidden=false;
});
$('focus-toggle').addEventListener('click',()=>{
  const focused=document.body.classList.toggle('demo-mode');
  $('focus-toggle').setAttribute('aria-pressed',String(focused));
  $('focus-toggle').textContent=focused?'退出放大演示':'放大课堂演示';
  $('lab').scrollIntoView({behavior:'smooth',block:'start'});
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('demo-mode'))$('focus-toggle').click();});
const answers={q1:{value:'b',text:'B 罐只剩 1 L 空间，所以只转移 1 L。A 还剩 2 L，B 变为 4 L：新状态 (2, 4)。'},q2:{value:'a',text:'当前水量相同，所以状态相同；不同搜索节点可以记录不同的父节点和路径代价。'},q3:{value:'b',text:'完备性关心能否保证找到解，最优性关心解的代价。这两种性质需要分别判断。'}};
$('quiz').addEventListener('submit',event=>{
  event.preventDefault();const data=new FormData(event.target);let missing=0,correct=0;
  for(const [name,answer] of Object.entries(answers)) {
    const chosen=data.get(name),el=$(`feedback-${name}`);el.hidden=false;
    if(!chosen){missing++;el.textContent='请先选择一个答案，再核对。';el.className='feedback pending';}
    else {const ok=chosen===answer.value;if(ok)correct++;el.textContent=(ok?'✓ 判断正确。':'再想一想。')+answer.text;el.className='feedback '+(ok?'correct':'incorrect');}
  }
  $('quiz-status').textContent=missing?`还有 ${missing} 题未选择，可补选后再次核对。`:`已核对 3 题，其中 ${correct} 题正确。请重点检查你的理由；可修改后再次核对。`;
});
render();

};
