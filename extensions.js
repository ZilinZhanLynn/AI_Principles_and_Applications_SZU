'use strict';
// Optional, original teaching examples. All numbers are illustrative.
(() => {
  const n = Number(new URLSearchParams(location.search).get('n') || 1);
  const host = document.getElementById('materials');
  if (!host) return;
  const topics = {
    2: [
      {
        title:'第 7 章 · 逻辑智能体：根据已知事实，推断下一步',
        source:'AIMA 第 7 章 Logical Agents · 入门选读，不纳入考试',
        text:'逻辑智能体把已知事实和规则写进知识库，再用推理得出结论、帮助选择行动。它回答的是：根据已经知道的内容，能推出什么？这与第 2 课“感知之后如何作出判断”直接相连。',
        example:'例如：规则是“纳入证据表前必须核验原文”，已知文献 A 尚未核验，就不能把它标为已核验并纳入。这是明确前提与规则下的教学例子，不是让逻辑自动判断论文结论真假。',
        reading:'先看 §7.1“基于知识的智能体”和 §7.2“Wumpus 世界”的情境图；有兴趣再看 §7.3 对逻辑与推理的解释。知道“事实—规则—推断”的关系即可，不要求做真值表、归结证明或实现推理算法。',
        application:'前沿连接：AI 提出证明，形式化工具检查证明。2026 年的 LEAP 研究让语言模型拆分数学证明任务，并持续利用 Lean 的检查反馈修改证明。先看论文摘要即可，无需学习 Lean 编程。',
        links:[['LEAP · 论文预印本 · 2026-06-02（修订 06-03）','https://arxiv.org/abs/2606.03303']],
        boundary:'这是与教材“明确表示、按规则推理”的概念联系，不是说 LEAP 直接使用本章的命题逻辑算法。Lean 的逻辑体系更丰富；通过检查也只说明证明符合形式化陈述与前提，不自动保证题意被准确翻译。流畅的自然语言回答不等于经过逻辑验证。',
        question:'材料里没有写识别方法，能直接填“随机实验”吗？',
        answer:'不能。没有记录不等于已知存在；应标注“材料未提供”，查阅原文或向用户追问。'
      },
      {
        title:'第 18 章 · 多智能体决策：不只考虑自己怎么做',
        source:'AIMA 第 18 章 Multiagent Decision Making · 入门选读，不纳入考试',
        text:'当多个智能体的行动相互影响，决策就不只是“我怎样完成任务”，还要考虑别人会怎样行动、大家如何协调，以及目标是否一致。合作、竞争和资源分配，都是这一章关心的问题。',
        example:'两个文献检索助手分别负责不同关键词：需要协调检索范围、去除重复文献，并把结论和原文位置交给复核者。分工增加了覆盖面，也可能产生重复劳动与相互矛盾的摘要。',
        reading:'先读 §18.1“多智能体环境的性质”；对任务分工感兴趣，可选看 §18.4.1 的任务分配例子。§18.2、§18.3 只需浏览非合作与合作博弈的介绍，不要求计算均衡或证明。版本提示：教师提供的英文 PDF 将本章编为第 17 章，对应 §17.1、§17.4.1；请按章节标题定位。',
        application:'应用实例：Anthropic 的多智能体研究助手由主智能体安排检索、子智能体分头搜集信息（2025）。近期研究还考察了多个 AI 在软件任务中的协作与冲突（2026-08）。重点看“谁分工、共享什么、怎样检查结果”，不必阅读实现细节。',
        links:[['研究助手如何分工 · 官方工程文章 · 2025-06-13','https://www.anthropic.com/engineering/multi-agent-research-system'],['多智能体的协作与问题 · 官方研究文章 · 2026-08-13','https://www.anthropic.com/research/multiagent-systems']],
        boundary:'多个 Agent 不一定比一个更好，也可能增加沟通成本或重复错误。工程中的“主智能体派任务”不等于博弈均衡，更不等于 Minimax；应先看各方目标、信息和决策权。',
        question:'让一个 AI 写答案、另一个 AI 检查，是否就一定可靠？',
        answer:'不一定。它们可能共享同样的错误信息，或没有真正独立核验。角色数量不是可靠性的保证，仍需要明确标准和可检查的证据。'
      },
      {title:'奖励设对了吗？', source:'AIMA 第 23 章 §23.1：从奖励中学习', text:'奖励未必完整表达真正的目标。这里用人为评分说明问题，不演示学习算法。', example:'文献助手的方案 A 用时 4 分钟，含 2 条未核验证据；方案 B 用时 7 分钟，全部核验。若只奖励节省时间，就会偏向 A。', widget:'reward', question:'把未核验惩罚设大，就足以保证证据真实可靠吗？', answer:'不能。还可能遗漏误读、断章取义或来源错误。正式纳入必须核验应作为硬性要求，不能为了省时间而用分数抵消。'}
    ],
    10: [
      {title:'从词元到 Transformer', source:'AIMA 第 24 章 §24.1；第 25 章 §25.1、§25.4–25.5', text:'词元（token）是模型处理的文本片段，不一定对应一个完整汉字或单词。嵌入把词元表示为向量；注意力计算不同位置之间的信息关联；模型据此给出后续词元的概率。训练调整参数，生成时利用已有参数逐步预测。', example:'下面是手工设定的接词玩具。改变上文会改变候选分布；它只说明条件概率的作用，不是实际模型输出或注意力权重。', widget:'tokens', question:'“去图书馆”的续写概率最高，能否证明说话者真的去了图书馆？', answer:'不能。续写概率衡量文本在给定上下文中的可能性，不是事实真实性的概率。Transformer 的注意力也不是事实核验器。'},
      {title:'看到“可疑”提示，就一定有问题吗？', source:'AIMA 第 12 章 §12.5：贝叶斯规则', text:'判断一个检测结果，还需要知道原本有多少情况属于目标类别。这叫基础比例。只看“能识别多少目标”，可能高估提示的可信度。', example:'假设 1000 封邮件中，检测器能标出 90% 的垃圾邮件，也会误标 10% 的正常邮件。改变垃圾邮件的基础比例，观察所有被标记邮件中有多少是真的垃圾邮件。', widget:'bayes', question:'相同检测器面对不同基础比例，提示的可靠程度为什么会改变？', answer:'被标记邮件来自两部分：真正的垃圾邮件和误标的正常邮件。正常邮件很多时，即使误报率不高，误报数量也可能很大。这里算的是邮件检测的条件概率，不是大模型自报置信度。'}
    ],
    13: [{title:'计划里的每一步，都能执行吗？', source:'AIMA 第 11 章 §11.1：经典规划的定义', text:'一个动作需要满足前置条件，执行后才会改变状态。例如送书之前必须先取到书。经典规划把这些条件明确写出；工具型 Agent 也需要检查工具输入、执行结果与完成证据。', example:'试着先点“送达”，再安排合理顺序。以下只模拟确定、可观察的送书流程，不调用真实工具。', widget:'planning', question:'语言模型写出的步骤很通顺，是否说明计划一定可执行？', answer:'不一定。它可能遗漏前置条件，也可能误判工具状态。应逐步核验动作是否合法、执行是否成功，并设定停止或求助条件。ReAct 等工具调用流程并不自动具备 A* 的最优性保证。'}],
    14: [{title:'一个好用的方案，还需要哪些边界？', source:'AIMA 第 28 章：人工智能的哲学、伦理与安全', text:'评价 AI 系统不只看平均正确率，还要考虑错误影响谁、谁能纠正它，以及它获得了哪些信息和行动权限。', example:'假设你做了“课程答疑助手”。学生提交提问后，它可能给出错误的考试范围、泄露他人的作业，或者引用不存在的课程规定。', widget:'', question:'为你的方案各写一条：不收集什么、哪些结论必须查证、什么情况要交给人处理。', answer:'示例：不上传同学的个人信息；考试范围必须依据教师发布的材料；涉及成绩更正时交给教师处理。具体边界应由任务及受影响的人决定。'}]
  };
  if (!topics[n]) return;
  const area = document.createElement('div');area.className='textbook-extras';
  area.innerHTML='<h3>从教材再走一步</h3><p class="muted">选读与选做 · 不新增考试要求</p>';
  if(n===2)area.innerHTML+='<p class="muted">想继续了解智能体？下面两章可作为阅读入口，只需知道大概含义和应用方向，不必现在学完。应用资料核验：2026-09-17。</p>';
  const widgets = {
    reward:'<label for="collision-cost">每条未核验证据扣分：<output id="collision-value">0</output></label><input id="collision-cost" type="range" min="0" max="5" step="0.5" value="0"><p id="reward-result" role="status"></p>',
    tokens:'<label for="token-context">选择上文</label><select id="token-context"><option value="study">明天要考试，我准备去…</option><option value="meal">现在有点饿，我准备去…</option></select><div id="token-bars" aria-live="polite"></div>',
    bayes:'<label for="base-rate">垃圾邮件占比：<output id="base-value">1%</output></label><input id="base-rate" type="range" min="1" max="50" value="1"><p id="bayes-counts"></p><p id="bayes-result" role="status"></p>',
    planning:'<p id="plan-state" role="status"></p><div class="mini-actions"><button type="button" class="button secondary" data-plan="deliver">送达</button><button type="button" class="button secondary" data-plan="collect">取书</button><button type="button" class="button secondary" data-plan="move">前往教学楼</button><button type="button" class="plain-button" data-plan="reset">重新开始</button></div><p id="plan-feedback" role="status">目标：把书从图书馆送到教学楼。</p>'
  };
  topics[n].forEach(t=>{
    const details=document.createElement('details');details.className='support extra-topic';
    // Content is authored locally, never supplied by a model or user at runtime.
    details.innerHTML=`<summary>${t.title}</summary><p class="textbook-source">${t.source}</p><p>${t.text}</p><p>${t.example}</p>${t.reading?`<p><strong>从哪里开始读：</strong>${t.reading}</p>`:''}${t.application?`<p><strong>与当下应用的连接：</strong>${t.application}</p>`:''}${t.links?`<div class="frontier-links">${t.links.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join('')}</div>`:''}${t.boundary?`<p><strong>注意边界：</strong>${t.boundary}</p>`:''}${t.widget?`<div class="mini-experiment">${widgets[t.widget]}</div>`:''}<p><strong>想一想：</strong>${t.question}</p><details class="support"><summary>查看解释</summary><p>${t.answer}</p></details>`;
    area.append(details);
  });
  host.querySelector('.lesson-pagination').before(area);
  const byId=id=>document.getElementById(id);
  const reward=byId('collision-cost');
  if(reward){const update=()=>{const cost=Number(reward.value),a=-4-2*cost,b=-7;byId('collision-value').textContent=cost;byId('reward-result').textContent=`A 得分 ${a}；B 得分 ${b}。${a===b?'两个方案同分。':a>b?'按当前奖励，会选 A。':'按当前奖励，会选 B。'}`;};reward.addEventListener('input',update);update();}
  const rate=byId('base-rate');
  if(rate){const update=()=>{const p=Number(rate.value),spam=10*p,trueFlag=spam*.9,falseFlag=(1000-spam)*.1;byId('base-value').textContent=p+'%';byId('bayes-counts').textContent=`1000 封中：垃圾邮件 ${spam} 封，正常邮件 ${1000-spam} 封。预计正确标记 ${trueFlag.toFixed(0)} 封，误标 ${falseFlag.toFixed(0)} 封。`;byId('bayes-result').textContent=`被标记邮件中，真正垃圾邮件占 ${trueFlag.toFixed(0)} ÷ (${trueFlag.toFixed(0)} + ${falseFlag.toFixed(0)}) ≈ ${(100*trueFlag/(trueFlag+falseFlag)).toFixed(1)}%。`;};rate.addEventListener('input',update);update();}
  const context=byId('token-context');
  if(context){const update=()=>{const values=context.value==='study'?[65,20,15]:[10,75,15];byId('token-bars').innerHTML=['图书馆','食堂','操场'].map((name,i)=>`<div class="prob-row"><span>${name}</span><meter min="0" max="100" value="${values[i]}" aria-label="${name} 概率">${values[i]}%</meter><span>${values[i]}%</span></div>`).join('');};context.addEventListener('change',update);update();}
  const state=byId('plan-state');
  if(state){let location='library',carrying=false,delivered=false;
    const render=()=>{state.textContent=`位置：${location==='library'?'图书馆':'教学楼'}；持书：${carrying?'是':'否'}；送达：${delivered?'是':'否'}。`;};
    area.querySelectorAll('[data-plan]').forEach(button=>button.addEventListener('click',()=>{
      const action=button.dataset.plan;let message='';
      if(action==='reset'){location='library';carrying=false;delivered=false;message='已重置。目标：把书送到教学楼。';}
      else if(delivered)message='目标已达成，可以停止；点击“重新开始”再试。';
      else if(action==='collect'){if(location!=='library')message='无法取书：书在图书馆。请重新开始规划。';else if(carrying)message='已经取到书，无需重复取书。';else{carrying=true;message='取书成功。状态从“未持书”变为“持书”。';}}
      else if(action==='move'){if(location==='classroom')message='已经在教学楼，无需重复移动。';else{location='classroom';message='已到教学楼。检查一下：你带书了吗？';}}
      else if(action==='deliver'){if(location!=='classroom'||!carrying)message='无法送达：需要同时满足“在教学楼”和“持有书”两个前置条件。';else{carrying=false;delivered=true;message='送达成功，目标已满足。停止执行。';}}
      render();byId('plan-feedback').textContent=message;
    }));render();
  }
})();
