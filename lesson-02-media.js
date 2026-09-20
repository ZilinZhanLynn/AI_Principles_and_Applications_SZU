'use strict';
(() => {
  if (new URLSearchParams(location.search).get('n') !== '2') return;
  if (window.CourseData.lessons.find(l=>l.n===2)?.caseStudy==='literature') return;
  const warmup = document.getElementById('warmup');
  if (!warmup) return;
  const section = document.createElement('section');
  section.id = 'agent-visuals'; section.className = 'lesson-section agent-visuals';
  section.innerHTML = `
    <p class="eyebrow">图解智能体</p><h2>先看见，再理解。</h2>
    <p>从一台吸尘器出发，看清“怎么评价、在哪工作、怎样行动、如何感知”。再把它缩小成两间房，观察决策是怎样发生的。</p>
    <figure class="lesson-figure peas-figure">
      <a href="assets/vacuum-peas.png" target="_blank" rel="noopener" aria-label="打开吸尘器 PEAS 高清配图"><img src="assets/vacuum-peas.png" width="1536" height="1024" loading="lazy" alt="吸尘器 PEAS：P 绩效度量是清洁程度、用时与能耗；E 环境包括地面、灰尘与障碍物；A 执行器包括驱动轮、吸尘电机与边刷；S 传感器用于测距、碰撞与灰尘检测。"></a>
      <figcaption>课程原创 AI 辅助配图 · 点击看大图。硬件为示意，不代表所有产品都具备图中传感器。</figcaption>
    </figure>
    <dl class="peas-key"><div><dt>P · 做得好不好</dt><dd>清洁程度、用时、能耗；P 是评价标准，不是机器人上的零件。</dd></div><div><dt>E · 在哪里工作</dt><dd>地面、灰尘、家具；换一个环境，任务难度也会变。</dd></div><div><dt>A · 靠什么行动</dt><dd>执行器是驱动轮、电机等；移动、吸尘是它们实现的动作。</dd></div><div><dt>S · 靠什么获取信息</dt><dd>传感器提供观察；能测到脚下有灰尘，不等于知道整间屋子的情况。</dd></div></dl>
    <div class="vacuum-demo" id="vacuum-demo">
      <p class="eyebrow">可播放演示 · 也可逐步观察</p><h3>只看到脚下，下一步怎么办？</h3>
      <p>把真实房间简化成 A、B 两格。假设动作总能成功，清洁后不会重新变脏。机器人只能感知自己的位置和脚下是否有灰尘。</p>
      <label for="vacuum-policy">比较两种策略</label>
      <select id="vacuum-policy"><option value="reflex">简单反射：脏就吸，干净就换一格</option><option value="memory">带记忆：记录两格状态，确认全干净后停止</option></select>
      <p class="vacuum-rule" id="vacuum-rule"></p>
      <div class="vacuum-world" role="img" aria-label="两房间吸尘器世界" id="vacuum-world">
        <div class="vacuum-room"><span class="room-name">房间 A</span><span class="floor-state" id="floor-a"></span><div class="dust-pile" id="dust-a" aria-hidden="true">● · ●<br>· ● ·</div></div>
        <div class="vacuum-room"><span class="room-name">房间 B</span><span class="floor-state" id="floor-b"></span><div class="dust-pile" id="dust-b" aria-hidden="true">● · ●<br>· ● ·</div></div>
        <div class="vacuum-robot" id="vacuum-robot" aria-hidden="true"><svg viewBox="0 0 100 100"><ellipse cx="50" cy="82" rx="35" ry="7" fill="#d4ccd0"/><path d="M20 60L9 72M19 62L14 82M22 65L27 83" stroke="#65525c" stroke-width="3"/><rect x="16" y="38" width="8" height="24" rx="3" fill="#493d43"/><rect x="76" y="38" width="8" height="24" rx="3" fill="#493d43"/><circle cx="50" cy="47" r="34" fill="white" stroke="#861b48" stroke-width="3"/><path d="M27 61Q50 76 73 61" fill="none" stroke="#c6b4bd" stroke-width="3"/><circle cx="50" cy="37" r="11" fill="#861b48"/><circle cx="65" cy="48" r="3" fill="#668e8f"/></svg></div>
      </div>
      <p class="vacuum-world-note">上图是给你的全局视角，机器人并不能直接看到两格的全部状态。</p>
      <ol class="agent-cycle" aria-label="感知判断行动循环"><li id="cycle-0">① 感知</li><li id="cycle-1">② 判断</li><li id="cycle-2">③ 行动</li></ol>
      <div class="vacuum-information"><p><strong>最近一次感知</strong><span id="vacuum-percept"></span></p><p><strong>保留的记忆</strong><span id="vacuum-memory"></span></p></div>
      <p class="vacuum-status" id="vacuum-status" role="status" aria-live="polite"></p>
      <div class="mini-actions"><button type="button" class="button secondary" id="vacuum-step">下一步：判断</button><button type="button" class="button secondary" id="vacuum-play" aria-pressed="false">播放演示</button><button type="button" class="plain-button" id="vacuum-reset">重新开始</button></div>
      <p class="muted" id="vacuum-count"></p>
      <details class="support"><summary>看完想一想：都干净了，为什么还在走？</summary><p>简单反射策略只检查当前格子，“当前干净”就触发移动。带记忆的策略能记录另一格已经清洁，并增加“确认两格都干净就停止”的规则。不同表现来自可用信息和决策规则的共同变化，不是只加一块存储器就自动更聪明。</p><p>本演示中不会重新产生灰尘。若现实环境会变，旧记忆可能过时，“上次干净”不代表“现在干净”，还需要再次检查。</p></details>
    </div>
    <div class="textbook-gallery" id="agent-textbook">
      <p class="eyebrow">回到教材原图</p><h3>图里的箭头，表示什么？</h3><p>先看“整体回路”，再比较“简单反射”和“带模型的反射”。不用背英文标签，重点找出输入、输出，以及多出来的信息。</p>
      <div class="figure-buttons" role="group" aria-label="选择教材图"><button type="button" data-agent-figure="loop" aria-pressed="true">整体回路</button><button type="button" data-agent-figure="reflex" aria-pressed="false">简单反射</button><button type="button" data-agent-figure="model" aria-pressed="false">带模型的反射</button></div>
      <figure class="lesson-figure"><a id="textbook-image-link" href="assets/aima-fig-2-1.png" target="_blank" rel="noopener" aria-label="打开当前教材图大图"><img id="textbook-image" src="assets/aima-fig-2-1.png" loading="lazy" alt="图 2.1：环境通过传感器提供感知，智能体通过执行器产生动作作用于环境。"></a><figcaption id="textbook-caption"></figcaption></figure>
      <p class="textbook-reading" id="textbook-reading" aria-live="polite"></p>
      <p class="muted">来源：Russell &amp; Norvig，《Artificial Intelligence: A Modern Approach》，第 2 章；摘自教师提供的英文 PDF，保留原图及图注，中文解读为课程补充。点击图片可放大查看。</p>
    </div>`;
  warmup.after(section);
  const nav = document.querySelector('.lesson-nav nav');
  const activityLink = nav.querySelector('a[href="#activity"]');
  const entry = document.createElement('a'); entry.href = '#agent-visuals'; entry.textContent = '图解与动态演示'; activityLink.before(entry);

  const figures = {
    loop: {file:'aima-fig-2-1.png', caption:'图 2.1 · 智能体与环境｜书内第 55 页（PDF 第 56 页）', alt:'环境通过传感器提供感知，智能体通过执行器产生动作作用于环境。', reading:'顺着箭头读：环境 → Sensors（传感器）→ 智能体 → Actuators（执行器）→ 环境。感知是输入，动作会改变环境；下一轮又获得新的感知。'},
    reflex: {file:'aima-fig-2-9.png', caption:'图 2.9 · 简单反射智能体｜书内第 68 页（PDF 第 69 页）', alt:'简单反射智能体根据当前感知得到当前情况，匹配条件—动作规则，再通过执行器行动。', reading:'看两处：What the world is like now（当前情况）与 Condition-action rules（条件—动作规则）。例如“当前有灰尘 → 吸尘”。此图没有用于保留感知历史的状态更新回路。'},
    model: {file:'aima-fig-2-11.png', caption:'图 2.11 · 基于模型的反射智能体｜书内第 70 页（PDF 第 71 页）', alt:'基于模型的反射智能体增加内部状态、世界变化模型与动作效果模型，再结合当前感知更新状态并选择动作。', reading:'相比上一图，多了 State（内部状态）、How the world evolves（世界如何变化）和 What my actions do（动作会造成什么结果）。它把历史信息与新感知结合起来；内部状态仍可能不完整或过时，并不等于知道一切。'}
  };
  const byId = id => document.getElementById(id);
  const showFigure = key => {
    const f = figures[key];
    byId('textbook-image').src = 'assets/' + f.file; byId('textbook-image').alt = f.alt;
    byId('textbook-image-link').href = 'assets/' + f.file;
    byId('textbook-caption').textContent = f.caption; byId('textbook-reading').textContent = f.reading;
    section.querySelectorAll('[data-agent-figure]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.agentFigure === key)));
  };
  section.querySelectorAll('[data-agent-figure]').forEach(button => button.addEventListener('click', () => showFigure(button.dataset.agentFigure)));
  showFigure('loop');
  let state = window.VacuumWorld.create(), timer = null, playedSteps = 0;
  const room = n => n === 0 ? 'A' : 'B';
  const cleanliness = dirty => dirty === null ? '未知' : dirty ? '脏' : '干净';
  const actionNames = {clean:'吸尘', left:'向左移动', right:'向右移动', stop:'停止'};
  const stop = () => { if(timer !== null) clearInterval(timer); timer = null; byId('vacuum-play').textContent = '播放演示'; byId('vacuum-play').setAttribute('aria-pressed','false'); };
  const render = () => {
    ['a','b'].forEach((key,i) => { byId('floor-'+key).textContent = cleanliness(state.dirt[i]); byId('dust-'+key).hidden = !state.dirt[i]; });
    byId('vacuum-robot').style.left = state.position === 0 ? '25%' : '75%';
    byId('vacuum-robot').classList.toggle('cleaning', state.phase === 2 && state.action === 'clean');
    byId('vacuum-world').setAttribute('aria-label', `全局视角：机器人在 ${room(state.position)}；A ${cleanliness(state.dirt[0])}，B ${cleanliness(state.dirt[1])}。`);
    for(let i=0;i<3;i++) { byId('cycle-'+i).classList.toggle('active', state.phase === i); if(state.phase === i) byId('cycle-'+i).setAttribute('aria-current','step'); else byId('cycle-'+i).removeAttribute('aria-current'); }
    byId('vacuum-percept').textContent = `${room(state.percept.room)} 格 · ${cleanliness(state.percept.dirty)}${state.phase===2?'（行动后尚未重新感知）':''}`;
    byId('vacuum-memory').textContent = state.mode === 'reflex' ? '不保留另一格的状态' : `A：${cleanliness(state.memory[0])}；B：${cleanliness(state.memory[1])}`;
    byId('vacuum-rule').textContent = state.mode === 'reflex' ? '规则：当前脏 → 吸尘；当前干净 → 移到另一格。' : '规则：当前脏 → 吸尘；记录显示两格都干净 → 停止；否则 → 移到另一格。';
    const action = actionNames[state.action];
    byId('vacuum-status').textContent = state.done ? '停止：根据已更新的记忆，两格都已干净。' : state.phase === 0 ? `感知：只读取 ${room(state.percept.room)} 格的状态，${state.mode==='memory'?'并更新该格记忆。':'不读取隔壁格子。'}` : state.phase === 1 ? `判断：依据当前感知${state.mode==='memory'?'和记忆':''}，选择“${action}”。` : `行动：已执行“${action}”。下一步要重新感知。`;
    byId('vacuum-step').textContent = state.done ? '演示完成' : ['下一步：判断','下一步：行动','下一步：再感知'][state.phase];
    byId('vacuum-step').disabled = state.done; byId('vacuum-play').disabled = state.done;
    byId('vacuum-count').textContent = `移动 ${state.moves} 次 · 吸尘 ${state.cleans} 次。播放每 1.5 秒推进一步，最多连续播放 24 步后暂停；可继续单步观察。`;
  };
  const tick = () => {state = window.VacuumWorld.advance(state); if(state.done) stop(); render();};
  byId('vacuum-step').addEventListener('click', () => {stop(); tick();});
  byId('vacuum-play').addEventListener('click', () => {
    if(timer !== null) {stop(); return;}
    playedSteps = 0; byId('vacuum-play').textContent = '暂停演示'; byId('vacuum-play').setAttribute('aria-pressed','true');
    timer = setInterval(() => {tick(); if(++playedSteps >= 24) stop();}, 1500);
  });
  const reset = () => {stop(); state = window.VacuumWorld.create(byId('vacuum-policy').value); render();};
  byId('vacuum-reset').addEventListener('click', reset); byId('vacuum-policy').addEventListener('change', reset);
  document.addEventListener('visibilitychange', () => {if(document.hidden) stop();});
  window.addEventListener('pagehide', stop);
  render();
  if (['#agent-visuals','#vacuum-demo','#agent-textbook'].includes(location.hash)) requestAnimationFrame(() => byId(location.hash.slice(1)).scrollIntoView());
})();
