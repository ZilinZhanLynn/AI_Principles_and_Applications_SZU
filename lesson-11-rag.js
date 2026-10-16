'use strict';
(() => {
  const n=Number(new URLSearchParams(location.search).get('n')||0);
  if(n!==11||!document.getElementById('warmup'))return;
  const by=id=>document.getElementById(id);
  const create=(tag,id,cls,html)=>{const el=document.createElement(tag);el.id=id;el.className=cls;el.innerHTML=html;return el;};
  document.body.classList.add('lesson-eleven');

  const foundations=create('section','rag-foundations','lesson-section rag-foundations',`
    <p class="eyebrow">稳定原理 · 先分清两个问题</p>
    <h2>检索找材料，生成组织回答。</h2>
    <p class="rag-lead">RAG（检索增强生成）把外部材料加入模型当前上下文。它可以让回答更容易核查，但检索到材料、正确理解材料和写出被证据支持的结论，是三个不同环节。</p>
    <div class="rag-concept-grid">
      <article><span>01</span><h3>检索相关性</h3><p>系统取回的材料是否真正回答研究问题，而不只是出现了相同关键词？</p></article>
      <article><span>02</span><h3>回答忠实度</h3><p>回答是否忠于给定证据，有没有把相关关系改写成因果关系？</p></article>
      <article><span>03</span><h3>引用可追溯</h3><p>关键主张能否定位到具体材料和片段，而不只是列出一个看起来完整的书目？</p></article>
    </div>
    <div class="rag-pipeline" aria-label="基础 RAG 的五个步骤">
      <span><b>1</b>提出问题</span><span><b>2</b>检索候选</span><span><b>3</b>重排序</span><span><b>4</b>依据证据回答</span><span><b>5</b>核验引用</span>
    </div>
    <div class="rag-boundary"><strong>本课边界</strong><p>基础 RAG 不会自动判断材料是否真实，也不会自动消除幻觉。课堂沙盒使用虚构文献卡片，训练的是检查方法，不是真实研究结论。</p></div>`);
  by('warmup').after(foundations);

  const lab=create('section','rag-lab','lesson-section rag-lab',`
    <div class="rag-lab-heading"><div><p class="eyebrow">Research Agent Lab · 课堂实践</p><h2>一次 RAG，从预测到核验。</h2></div><span class="save-state" id="rag-save-state" role="status">尚未运行</span></div>
    <p>研究问题已经给出。你只需先选材料、运行，再改变一个条件，不需要写长报告。</p>
    <label class="rag-question-label" for="rag-question">研究问题</label>
    <input id="rag-question" class="rag-question" value="数字金融是否促进家庭消费？" maxlength="80">
    <div class="rag-step-card">
      <div class="rag-step-title"><span>1</span><div><h3>先预测：哪些材料值得进入证据集？</h3><p>可多选。先依据标题和摘要判断，运行后再核对。</p></div></div>
      <div id="rag-papers" class="rag-paper-grid"></div>
      <p id="rag-prediction-feedback" class="rag-feedback" role="status">先选择你认为相关的材料。</p>
    </div>
    <div class="rag-step-card">
      <div class="rag-step-title"><span>2</span><div><h3>设置一次检索</h3><p>第一次建议保持默认值；第二次只改变一个条件。</p></div></div>
      <div class="rag-controls">
        <label>取回数量 Top-k<select id="rag-topk"><option value="1">1 条</option><option value="2" selected>2 条</option><option value="3">3 条</option></select></label>
        <label class="rag-switch"><input id="rag-rerank" type="checkbox" checked><span>使用语义重排序</span></label>
        <button id="rag-run" class="button" type="button">运行 RAG 沙盒</button>
      </div>
      <p class="muted">确定性课堂模拟 · 不调用真实数据库或大模型</p>
    </div>
    <div id="rag-results" class="rag-results" hidden>
      <div class="rag-trace" aria-label="本次 RAG 轨迹">
        <div data-stage="retrieve"><span>检索</span><b id="rag-retrieve-status">等待</b></div>
        <div data-stage="rerank"><span>重排序</span><b id="rag-rerank-status">等待</b></div>
        <div data-stage="generate"><span>生成</span><b>依据证据</b></div>
        <div data-stage="verify"><span>核验</span><b>由你完成</b></div>
      </div>
      <div class="rag-output-grid">
        <section><p class="rag-panel-label">取回的证据</p><div id="rag-evidence"></div></section>
        <section><p class="rag-panel-label">基于当前证据的回答</p><div id="rag-answer" class="rag-answer"></div></section>
      </div>
      <p id="rag-comparison" class="rag-comparison" role="status"></p>
    </div>
    <div class="rag-step-card rag-verify-card">
      <div class="rag-step-title"><span>3</span><div><h3>逐条核验，而不是看起来像就算对</h3><p>完成一次运行后，根据材料片段判断三个主张。</p></div></div>
      <form id="rag-claim-form"></form>
      <button id="rag-check-claims" class="button secondary" type="button">核对证据判断</button>
      <p id="rag-claim-feedback" class="rag-feedback" role="status">三个判断都可以修改后重新核对。</p>
    </div>`);
  foundations.after(lab);

  const frontier=create('section','rag-frontier','lesson-section rag-frontier',`
    <div class="rag-frontier-heading"><div><p class="eyebrow">前沿窗口 · 拓展不考</p><h2>RAG 正在从“一次检索”走向“动态决定下一步”。</h2></div><time datetime="2026-09">更新于 2026-09</time></div>
    <p>下面不是三个必须记忆的产品名称，而是三类正在发展的设计思路。先理解它们试图修复基础 RAG 的哪个环节。</p>
    <div class="rag-frontier-grid">
      <details open><summary><span>01</span>GraphRAG · 跨文档关系</summary><div><p>把实体、关系和主题组织成图，帮助回答需要跨越多篇材料的整体问题。它不是向量检索的万能替代，也需要付出建图和维护成本。</p><a href="https://www.microsoft.com/en-us/research/project/graphrag/" target="_blank" rel="noopener noreferrer">Microsoft Research · GraphRAG ↗</a></div></details>
      <details><summary><span>02</span>Self-RAG／纠错型 RAG · 检查是否需要重来</summary><div><p>让系统反思是否需要检索、证据是否相关、回答是否被支持，必要时重新检索或修正。反思仍可能出错，因此必须通过测试评价。</p><a href="https://arxiv.org/abs/2310.11511" target="_blank" rel="noopener noreferrer">Self-RAG 原始论文 ↗</a></div></details>
      <details><summary><span>03</span>Agentic RAG · 由过程决定何时继续</summary><div><p>Agent 根据当前证据缺口决定查询、读取、改写问题或停止。自主性提高的同时，也会增加调用成本、循环风险和评价难度。</p><a href="https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents" target="_blank" rel="noopener noreferrer">Context Engineering · 官方工程文章 ↗</a></div></details>
    </div>
    <div class="rag-boundary"><strong>不要过度推断</strong><p>“更复杂”不等于“更可靠”。混合检索、图、反思或多 Agent 是否值得加入，应由固定测试集、证据质量、时延和成本共同决定。</p></div>`);
  by('materials').before(frontier);

  const activity=by('activity');
  activity.classList.add('rag-activity-summary');
  activity.querySelector('.eyebrow').textContent='完成标准与自查';
  activity.querySelector('h2').textContent='最后说清楚：证据支持了什么？';
  const scratchLabel=activity.querySelector('.scratch-label');
  if(scratchLabel)scratchLabel.remove();
  const scratch=activity.querySelector('#scratch');
  if(scratch)scratch.remove();

  const papers=[
    {id:'A',title:'数字金融与家庭消费：基于家庭调查的分析',meta:'虚构材料 A · 观察性研究',snippet:'数字金融指数与家庭消费呈显著正相关；研究没有随机分配，不能据此确认因果关系。',relevant:true},
    {id:'B',title:'移动支付、交易摩擦与日常消费',meta:'虚构材料 B · 小样本访谈',snippet:'受访者认为移动支付提高了便利性、降低了交易摩擦；样本有限，未估计总体消费效应。',relevant:true},
    {id:'C',title:'金融科技与制造企业创新',meta:'虚构材料 C · 企业研究',snippet:'研究对象是制造企业，关注研发投入与专利，不讨论家庭消费。',relevant:false},
    {id:'D',title:'家庭消费的宏观周期变化',meta:'虚构材料 D · 宏观分析',snippet:'讨论收入预期与消费周期，没有测量数字金融或移动支付。',relevant:false}
  ];
  by('rag-papers').innerHTML=papers.map(p=>`<label class="rag-paper"><input type="checkbox" value="${p.id}"><span class="rag-paper-id">${p.id}</span><span><strong>${p.title}</strong><small>${p.meta}</small><em>${p.snippet}</em></span></label>`).join('');
  const claims=[
    {id:'cause',text:'“给定材料证明数字金融一定会导致家庭消费增加。”',answer:'insufficient',why:'材料 A 只报告相关关系，并明确不能据此确认因果。'},
    {id:'friction',text:'“材料 B 提示移动支付可能降低交易摩擦。”',answer:'support',why:'材料 B 的访谈片段直接提供了这一可能机制。'},
    {id:'household',text:'“材料 C 的研究对象是家庭。”',answer:'conflict',why:'材料 C 明确研究制造企业，与该主张矛盾。'}
  ];
  by('rag-claim-form').innerHTML=claims.map((c,i)=>`<fieldset><legend><span>${i+1}</span>${c.text}</legend><div class="rag-choice-row"><label><input type="radio" name="${c.id}" value="support">有证据支持</label><label><input type="radio" name="${c.id}" value="insufficient">证据不足</label><label><input type="radio" name="${c.id}" value="conflict">与证据矛盾</label></div><p id="rag-claim-${c.id}" class="rag-inline-feedback" hidden></p></fieldset>`).join('');

  let previous=null;
  const localKey='szu-ai-course-rag-lesson-11';
  const selectedPrediction=()=>[...by('rag-papers').querySelectorAll('input:checked')].map(input=>input.value);
  const save=data=>{
    by('rag-save-state').textContent='正在暂存…';
    try{localStorage.setItem(localKey,JSON.stringify(data));by('rag-save-state').textContent='已在本机暂存 · '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});}
    catch(error){by('rag-save-state').textContent='暂存失败 · 仍可继续课堂操作';}
  };
  const run=()=>{
    const predicted=selectedPrediction();
    const topk=Number(by('rag-topk').value),rerank=by('rag-rerank').checked;
    const order=(rerank?['A','B','C','D']:['A','C','B','D']).slice(0,topk);
    const selected=order.map(id=>papers.find(p=>p.id===id));
    const hit=predicted.filter(id=>['A','B'].includes(id)).length;
    const falseHit=predicted.filter(id=>!['A','B'].includes(id));
    by('rag-prediction-feedback').textContent=predicted.length?`你选了 ${predicted.join('、')}；其中 ${hit} 条与问题直接相关${falseHit.length?'，'+falseHit.join('、')+'只是在关键词或主题上相近':''}。`:'你没有先选材料；这次仍会运行，但建议重置后先作预测。';
    by('rag-retrieve-status').textContent=`取回 ${topk} 条`;
    by('rag-rerank-status').textContent=rerank?'已启用':'未启用';
    by('rag-evidence').innerHTML=selected.map(p=>`<article class="rag-evidence-card ${p.relevant?'is-relevant':'is-distractor'}"><header><span>${p.id}</span><strong>${p.title}</strong></header><p>${p.snippet}</p><small>${p.relevant?'与研究问题直接相关':'当前证据链中的干扰材料'}</small></article>`).join('');
    const has=id=>order.includes(id);
    const sentences=[];
    if(has('A'))sentences.push('在给定材料中，数字金融指标与家庭消费呈正相关 [A]；由于材料采用观察性数据，不能把该结果直接解释为因果关系。');
    if(has('B'))sentences.push('访谈材料提示，移动支付可能通过提高便利性、降低交易摩擦影响消费行为，但样本有限 [B]。');
    if(has('C'))sentences.push('材料 C 研究企业创新，不能用于支持家庭消费结论 [C]。');
    if(!has('A')&&!has('B'))sentences.push('当前取回材料不足以回答问题，需要改写查询或继续检索。');
    by('rag-answer').innerHTML=`<p>${sentences.join('</p><p>')}</p><div class="rag-answer-note"><strong>回答边界</strong>这里只能总结给定材料，不能据此判断全部现实研究，也不能确认因果效应。</div>`;
    const config={topk,rerank,order};
    if(previous){const changed=[];if(previous.topk!==topk)changed.push(`Top-k：${previous.topk} → ${topk}`);if(previous.rerank!==rerank)changed.push(`重排序：${previous.rerank?'开':'关'} → ${rerank?'开':'关'}`);by('rag-comparison').textContent=changed.length?`本次只应改变一个条件。检测到：${changed.join('；')}。证据顺序由 ${previous.order.join('、')} 变为 ${order.join('、')}。`:'条件没有改变。请选择一个条件修改后再运行，比较证据链。';}
    else by('rag-comparison').textContent='第一次运行已完成。现在只改变 Top-k 或“语义重排序”中的一个，再运行一次。';
    previous=config;by('rag-results').hidden=false;
    save({lesson:11,question:by('rag-question').value,predicted,config,updatedAt:new Date().toISOString()});
  };
  by('rag-run').addEventListener('click',run);
  by('rag-check-claims').addEventListener('click',()=>{
    const data=new FormData(by('rag-claim-form'));let correct=0,missing=0;
    claims.forEach(c=>{const value=data.get(c.id),node=by('rag-claim-'+c.id);node.hidden=false;if(!value){missing++;node.className='rag-inline-feedback pending';node.textContent='请先选择一个判断。';return;}const ok=value===c.answer;if(ok)correct++;node.className='rag-inline-feedback '+(ok?'correct':'incorrect');node.textContent=(ok?'判断正确。':'再核对材料。')+c.why;});
    by('rag-claim-feedback').textContent=missing?`还有 ${missing} 条未判断。`:`已核对 ${claims.length} 条，其中 ${correct} 条判断正确。重点不是分数，而是能否指出证据位置和推断边界。`;
    save({lesson:11,question:by('rag-question').value,claims:Object.fromEntries(claims.map(c=>[c.id,data.get(c.id)||''])),updatedAt:new Date().toISOString()});
  });
})();
