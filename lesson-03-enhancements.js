'use strict';
(() => {
  if (new URLSearchParams(location.search).get('n') !== '3') return;
  const byId = id => document.getElementById(id);
  if (!byId('lab')) return;
  document.body.classList.add('lesson-three');
  // Put exploration before the written task; retain the existing form and inputs.
  byId('interactive').after(byId('activity'));
  const nav = document.querySelector('.lesson-nav nav');
  nav.replaceChildren();
  [['overview','本课要点'],['lab','① 倒水体验'],['model','② 问题建模'],['concepts','③ 看懂搜索'],['practice','④ 自己算'],['activity','⑤ 写建模卡'],['materials','课件与选读']].forEach(([id,label])=>{
    const a=document.createElement('a');a.href='#'+id;a.textContent=label;nav.append(a);
  });
  const warmLink = document.createElement('a'); warmLink.href='#lab';warmLink.className='text-link';warmLink.textContent='进入水罐实验，先试几步 ↓';byId('warmup').append(warmLink);
  byId('model').querySelector('h2').textContent='从刚才的操作，提炼出五项定义。';
  byId('model').querySelector('.model-list details:nth-child(3) summary').innerHTML='<span>03</span>能做什么？做完会怎样？';
  const nodeSection=document.createElement('div');nodeSection.className='jug-node-card';nodeSection.id='jug-node-card';
  nodeSection.innerHTML=`<p class="eyebrow">你的操作 → 一条搜索节点记录</p><h3>水量相同，记录不一定相同。</h3><p>继续操作上方水罐，或撤销一步，看看下面哪些字段改变。这里展示你走过的一条路径，不是整个搜索过程。</p><dl class="node-fields"><div><dt>当前状态</dt><dd id="node-state"></dd></div><div><dt>父节点状态</dt><dd id="node-parent"></dd></div><div><dt>到达动作</dt><dd id="node-action"></dd></div><div><dt>深度 / 累计代价 g</dt><dd id="node-cost"></dd></div></dl><p id="node-transition" class="node-transition" role="status" aria-live="polite"></p><button id="expand-current" class="button secondary" type="button" aria-expanded="false" aria-controls="successor-panel">试着扩展：列出合法后继</button><div id="successor-panel" hidden><p>下面只是列出“可以怎么走”，不会执行动作或改变水量。不改变状态的操作在本实验中省略。</p><ul id="successor-list"></ul><p class="muted">这些后继可成为等待探索的候选节点。由边界表中的哪一个继续扩展，要看搜索策略；第 4 课再学习 BFS 的选择规则。</p></div>`;
  byId('lab').querySelector('.experiment').after(nodeSection);
  let record={state:[0,0],parent:null,action:null,depth:0,cost:0};
  const format=s=>`(${s[0]}, ${s[1]})`;
  const renderSuccessors=()=>{
    byId('successor-list').replaceChildren();
    for(const action of Object.keys(Jug.labels)) {
      const result=Jug.transition(record.state,action);
      if(Jug.equal(record.state,result))continue;
      const li=document.createElement('li');li.textContent=`${Jug.labels[action]} → ${format(result)}；子节点 g = ${record.cost+1}`;byId('successor-list').append(li);
    }
  };
  const update=detail=>{
    record=detail;
    byId('node-state').textContent=format(record.state);byId('node-parent').textContent=record.parent?format(record.parent):'无（根节点）';
    byId('node-action').textContent=record.action?Jug.labels[record.action]:'尚未行动';
    byId('node-cost').textContent=`${record.depth} / ${record.cost}`;
    let transition=record.parent?`${format(record.parent)} → ${Jug.labels[record.action]} → ${format(record.state)}`:'初始节点：状态 (0, 0)，深度 0，路径代价 0。';
    if(record.action==='pourAB')transition+=`。本次转移 min(${record.parent[0]}, 4 − ${record.parent[1]}) = ${Math.min(record.parent[0],4-record.parent[1])} L。`;
    if(record.action==='pourBA')transition+=`。本次转移 min(${record.parent[1]}, 3 − ${record.parent[0]}) = ${Math.min(record.parent[1],3-record.parent[0])} L。`;
    byId('node-transition').textContent=transition;
    if(!byId('successor-panel').hidden)renderSuccessors();
  };
  document.addEventListener('jug:change',event=>update(event.detail));update(record);
  byId('expand-current').addEventListener('click',()=>{
    const show=byId('successor-panel').hidden;byId('successor-panel').hidden=!show;byId('expand-current').setAttribute('aria-expanded',String(show));
    byId('expand-current').textContent=show?'收起合法后继':'试着扩展：列出合法后继';if(show)renderSuccessors();
  });
  const diagram=document.createElement('div');diagram.className='search-representation';diagram.id='search-representation';
  diagram.innerHTML=`<h3>同一个水量，为什么出现两次？</h3><p>只看水罐问题中的两条路径。它们都到达 (3, 4)，但一条用了 2 步，另一条用了 3 步。注意：(3, 4) 不是本题目标；此处只比较记录。</p><div class="representation-tabs" role="group" aria-label="切换状态图与搜索树"><button type="button" data-representation="graph" aria-pressed="true">状态图：相同状态合在一起</button><button type="button" data-representation="tree" aria-pressed="false">搜索树：按路径分别展开</button></div><div id="representation-picture"></div><p id="representation-explanation" class="note" role="status" aria-live="polite"></p><div class="route-records"><article><h4>路径 ① · 2 步</h4><p>(0,0) → 装满 A → (3,0)<br>→ 装满 B → (3,4)</p><dl><dt>终点节点记录</dt><dd>状态 (3,4)；父节点状态 (3,0)；到达动作：装满 B；g = 2。</dd></dl></article><article><h4>路径 ② · 3 步</h4><p>(0,0) → 装满 B → (0,4)<br>→ B 倒向 A → (3,1)<br>→ 装满 B → (3,4)</p><dl><dt>终点节点记录</dt><dd>状态 (3,4)；父节点状态 (3,1)；到达动作：装满 B；g = 3。</dd></dl></article></div><p class="muted">图中省略其他状态和动作，仅为局部示意。无论画成哪种图，状态转移规则都没有改变。</p>`;
  byId('concepts').querySelector('.concept-grid').before(diagram);
  const svgNode=(x,y,label,accent=false)=>`<g><rect x="${x-54}" y="${y-24}" width="108" height="48" rx="12" fill="${accent?'#861b48':'#fff'}" stroke="${accent?'#861b48':'#ac95a1'}" stroke-width="2"/><text x="${x}" y="${y+7}" text-anchor="middle" font-size="22" fill="${accent?'white':'#332b30'}">${label}</text></g>`;
  const renderDiagram=mode=>{
    const isTree=mode==='tree';
    const nodes=isTree?[[240,40,'(0,0)'],[95,145,'(3,0)'],[385,145,'(0,4)'],[95,260,'(3,4)',true],[385,260,'(3,1)'],[385,370,'(3,4)',true]]:[[240,40,'(0,0)'],[95,145,'(3,0)'],[385,145,'(0,4)'],[385,250,'(3,1)'],[200,355,'(3,4)',true]];
    const edges=isTree?'M214 64L120 120 M266 64L360 120 M95 170L95 233 M385 170L385 233 M385 285L385 343':'M214 64L120 120 M266 64L360 120 M385 170L385 223 M95 170L184 327 M355 274L238 328';
    byId('representation-picture').innerHTML=`<svg viewBox="0 0 480 410" role="img" aria-labelledby="representation-title"><title id="representation-title">${isTree?'搜索树中两条路径分别产生状态为 (3,4) 的节点':'局部状态图中两条路径汇合到同一状态 (3,4)'}</title><defs><marker id="representation-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#ac95a1"/></marker></defs>${edges.split(/(?=M)/).filter(Boolean).map(edge=>`<path d="${edge.trim()}" fill="none" stroke="#ac95a1" stroke-width="2.5" marker-end="url(#representation-arrow)"/>`).join('')}${nodes.map(n=>svgNode(...n)).join('')}</svg>`;
    byId('representation-explanation').textContent=isTree?'这里有两个状态为 (3,4) 的搜索节点：它们记录不同的来路，g 分别为 2 和 3。同状态，不等于同节点。':'这里把 (3,4) 画成一个状态。两条路径都能到达它；从这个水量出发，可用动作只取决于当前水量。';
    diagram.querySelectorAll('[data-representation]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.representation===mode)));
  };
  diagram.querySelectorAll('[data-representation]').forEach(button=>button.addEventListener('click',()=>renderDiagram(button.dataset.representation)));
  renderDiagram('graph');
  const costExample=document.createElement('div');costExample.className='path-cost-example';
  costExample.innerHTML=`<h3>迁移到课件：步数更少，距离一定更短吗？</h3><p>水罐实验把每步代价设为 1，所以“最少步数”就是“最低代价”。道路长度不同时，要累计距离。</p><div class="route-records"><article><h4>路线 A · 3 段道路</h4><p>Arad → Sibiu → Fagaras → Bucharest</p><p>140 + 99 + 211 = ? km</p></article><article><h4>路线 B · 4 段道路</h4><p>Arad → Sibiu → Rimnicu Vilcea → Pitesti → Bucharest</p><p>140 + 80 + 97 + 101 = ? km</p></article></div><details class="support"><summary>算完后，核对结果</summary><p>A 为 450 km，B 为 418 km。B 多走了一段道路，却少走 32 km。这里只比较这两条路线，不能仅凭这次比较证明 B 在全图中最优。</p></details><p class="muted">对应原课件 PDF 第 21–22 页。这里是罗马尼亚地图中的路线，不是意大利罗马市。</p>`;
  byId('concepts').append(costExample);
  if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());
})();
