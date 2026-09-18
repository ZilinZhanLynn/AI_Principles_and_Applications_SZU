window.initializeSearchWidgets = function(lessonNumber){
'use strict';
const $=id=>document.getElementById(id);
if(document.getElementById('graph-search')){
let alg='bfs',searchIndex=0,searchSteps=SearchCore.searchTrace(alg);
const positions={S:[70,135],A:[190,60],B:[190,210],C:[320,60],D:[320,210],G:[435,135]};
function renderSearch(){
 const s=searchSteps[searchIndex];
 $('frontier').textContent=s.frontier.join(' → ')||'—';
 $('visited').textContent=s.visited.join(', ')||'—';
 $('expanded').textContent=s.current||'—';
 $('search-message').textContent=s.message;
 $('search-step').disabled=searchIndex===searchSteps.length-1;
 $('search-back').disabled=searchIndex===0;
 document.querySelectorAll('.graph-nodes circle').forEach(c=>{const n=c.dataset.node;c.classList.toggle('visited',s.visited.includes(n));c.classList.toggle('current',s.current===n);c.classList.toggle('goal',n==='G'&&s.done);});
 document.querySelectorAll('.graph-labels text').forEach(t=>t.style.fill=t.textContent===s.current?'white':'#5d4d57');
 const path=[];if(s.done){let n='G';while(n){path.unshift(n);n=s.parents[n];}}
 $('search-path').setAttribute('d',path.map((n,i)=>(i?'L':'M')+positions[n].join(' ')).join(''));
 $('search-path').style.opacity=s.done?'1':'0';
}
document.querySelectorAll('.algorithm').forEach(b=>b.addEventListener('click',()=>{
 alg=b.dataset.alg;searchIndex=0;searchSteps=SearchCore.searchTrace(alg);
 document.querySelectorAll('.algorithm').forEach(x=>{const on=x===b;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on));});
 $('algorithm-note').textContent=alg==='bfs'?'BFS：队首取出，新后继加入队尾。本图按 A、B、C…顺序处理，已经发现的状态不重复加入。':'DFS：栈顶取出，新后继放到栈顶，并保持较前字母优先。本图的去重规则与 BFS 相同。';
 renderSearch();
}));
$('search-step').addEventListener('click',()=>{searchIndex=Math.min(searchIndex+1,searchSteps.length-1);renderSearch();});
$('search-back').addEventListener('click',()=>{searchIndex=Math.max(0,searchIndex-1);renderSearch();});
$('search-reset').addEventListener('click',()=>{searchIndex=0;renderSearch();});
renderSearch();
if(lessonNumber===5)document.querySelector('[data-alg="dfs"]').click();
}
if(document.getElementById('game-search')){
let gameAlg='minimax',gameIndex=0,gameSteps=SearchCore.gameTrace(false);
let leafValues=[3,5,2,9],reverse=false;
const controls=document.createElement('div');controls.className='course-interaction';
controls.innerHTML='<h3>改一个终局值，再作一次判断</h3><p>这是完整终局树，不是有限深度评价。先预测根会不会换选择，再修改右侧第一个叶子（初始为 2）。修改后会从头演算。</p><label for="game-leaf-value">右侧第一个终局值</label><select id="game-leaf-value">'+[0,1,2,3,4,5,6,7,8,9,10].map(v=>'<option'+(v===2?' selected':'')+'>'+v+'</option>').join('')+'</select><label for="game-order">访问顺序</label><select id="game-order"><option value="forward">从左到右</option><option value="reverse">从右到左</option></select><label for="game-explain">解释：为什么改变（或没有改变）根值？哪些分支可以剪？</label><textarea id="game-explain" rows="3" placeholder="先写两个 MIN 的值，再比较 MAX。临时记录，不上传。"></textarea><details class="support"><summary>写完后，核对完整树的结果</summary><p id="game-condition-answer"></p></details>';
$('game-search').append(controls);
function updateCondition(){leafValues[2]=Number($('game-leaf-value').value);reverse=$('game-order').value==='reverse';gameIndex=0;gameSteps=SearchCore.gameTrace(gameAlg==='alphabeta',{values:leafValues,reverse});controls.querySelector('details').open=false;$('game-explain').value='';renderGame();}
$('game-leaf-value').addEventListener('change',updateCondition);$('game-order').addEventListener('change',updateCondition);
const fmt=n=>n===Infinity?'∞':n===-Infinity?'−∞':String(n);
function renderGame(){
 const s=gameSteps[gameIndex];
 $('leaf-count').textContent=s.visited.length+' / 4';
 $('game-level').textContent=gameIndex===0?'等待访问':s.current;
 $('game-result').textContent='根：'+s.values.root+'；左：'+s.values.L+'；右：'+s.values.R;
 $('game-message').textContent=s.message;
 $('game-bounds').textContent=gameAlg==='alphabeta'?'当前调用 α='+fmt(s.alpha)+'，β='+fmt(s.beta):'逐个访问叶子，MIN 取小、MAX 取大。';
 const left=Math.min(leafValues[0],leafValues[1]),right=Math.min(leafValues[2],leafValues[3]);
 $('game-condition-answer').textContent=`完整计算时，左 MIN=${left}，右 MIN=${right}，根 MAX=${Math.max(left,right)}，${left===right?'两侧同值':left>right?'选择左侧':'选择右侧'}。访问顺序改变可能影响剪枝数量，但不改变同一完整树的根值。剪枝中途，未完整计算的子树仍只知道界。`;
 $('game-step').disabled=gameIndex===gameSteps.length-1;$('game-back').disabled=gameIndex===0;
 const ids=['root','L','R','l1','l2','r1','r2'];
 document.querySelectorAll('.game-nodes circle').forEach((c,i)=>{const id=ids[i];c.classList.toggle('resolved',Object.hasOwn(s.values,id));c.classList.toggle('current',s.current===id);c.classList.toggle('pruned',s.pruned.includes(id));});
 document.querySelectorAll('.game-labels text').forEach((t,i)=>{const id=ids[i];t.textContent=s.values[id]||({'l1':leafValues[0],'l2':leafValues[1],'r1':leafValues[2],'r2':leafValues[3]}[id]);t.style.fill=s.current===id?'white':'#5d4d57';t.style.textDecoration=s.pruned.includes(id)?'line-through':'none';});
 $('game-log').replaceChildren(...gameSteps.slice(1,gameIndex+1).map(step=>{const li=document.createElement('li');li.textContent=step.message;return li;}));
}
document.querySelectorAll('.game-alg').forEach(b=>b.addEventListener('click',()=>{
 gameAlg=b.dataset.game;gameIndex=0;gameSteps=SearchCore.gameTrace(gameAlg==='alphabeta',{values:leafValues,reverse});
 document.querySelectorAll('.game-alg').forEach(x=>{const on=x===b;x.classList.toggle('active',on);x.setAttribute('aria-pressed',String(on));});
 $('game-bound-label').textContent='回传值与界';
 $('game-note').textContent=gameAlg==='minimax'?'MIN 选择较小效用，MAX 选择较大效用。逐步回传并检查，不把叶子的最大值直接当作根值。':'Alpha-Beta：当 β≤α 时，剩余分支不能改善已有选择。被剪子树的返回界与完整求得的精确值要区分。';
 renderGame();
}));
$('game-step').addEventListener('click',()=>{gameIndex=Math.min(gameIndex+1,gameSteps.length-1);renderGame();});
$('game-back').addEventListener('click',()=>{gameIndex=Math.max(0,gameIndex-1);renderGame();});
$('game-reset').addEventListener('click',()=>{gameIndex=0;renderGame();});renderGame();

if(lessonNumber===11)document.querySelector('[data-game="alphabeta"]').click();
}
};
