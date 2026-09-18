'use strict';
// Curated primary sources. These course connections are teaching interpretations,
// not claims that modern systems implement AIMA's architectures unchanged.
(() => {
  if (new URLSearchParams(location.search).get('n') !== '2') return;
  const pagination = document.querySelector('#materials .lesson-pagination');
  if (!pagination) return;
  const readings = [
    {
      concept: '感知 → 行动 · PEAS', level: '从演示入门',
      title: '游戏里的 AI，怎样把一句话变成行动？',
      source: 'Google DeepMind · SIMA 2', date: '2025-11-13', type: '官方研究介绍与视频',
      description: 'SIMA 2 将 Gemini 与虚拟世界中的行动能力结合，研究如何理解语言目标并在不同 3D 游戏中执行任务。官方页面提供了任务演示，也讨论了仍然存在的局限。',
      connection: '用 AIMA 第 2 章的 PEAS 给演示写一张任务卡：屏幕画面是什么输入？键盘、鼠标操作是什么输出？“完成目标”和“动作像人”是同一个评价标准吗？',
      guide: '先看页面开头的演示，再选看 “The Power of Reasoning” 和 “Next steps”；无需阅读全部技术细节。',
      question: '假设任务是找到营火，只凭当前屏幕，智能体能知道整张地图上营火的位置吗？',
      answer: '通常不能。若没有完整地图或其他信息，当前画面只是环境的一部分；需要移动、观察，并保留已经探索过的信息。这里的环境分类取决于我们给智能体开放了什么信息，而不是游戏本身是否“知道”所有状态。',
      boundary: '这是虚拟环境中的研究演示，不能直接推断它能安全完成真实校园里的送书任务。',
      links: [['阅读原文 / 查看演示', 'https://deepmind.google/blog/sima-2-an-agent-that-plays-reasons-and-learns-with-you-in-virtual-3d-worlds/']]
    },
    {
      concept: '部分可观察 · 动态环境', level: '2026 研究选读',
      title: '会点鼠标，为什么还不一定会办事？',
      source: 'OSWorld 2.0 · 研究团队', date: '2026-06-28', type: '论文预印本与项目页（论文修订：2026-07-13）',
      description: 'OSWorld 2.0 用 108 个较长的电脑操作流程评测智能体，关注动态信息、跨来源推理、隐含状态等困难，而不只是能否完成一次点击。',
      connection: 'AIMA 第 2 章的环境分类可以帮助解释这些困难：信息没显示在当前界面上，对应可观察性的限制；执行中来了新要求，对应动态变化；早先的操作影响后续任务，体现序贯性。',
      guide: '先读论文摘要，再看项目页的 “Failure Cases”，选一个失败过程；不要求运行基准或看排行榜。',
      question: '送书途中，老师发来消息说教室换了。机器人仍按旧任务卡送达，问题一定出在路线搜索算法吗？',
      answer: '不一定。它可能没有接收新消息，也可能接收后没有更新目标。应先区分感知、状态更新、目标更新和行动执行，再判断是哪一步出了问题。找到旧目标的最短路，并不代表完成了更新后的任务。',
      boundary: '基准成绩依赖任务、工具权限、预算和版本；某套测试上的表现不代表所有现实任务。这里引用的是 OSWorld 2.0 论文，不把后续版本的分数混在一起。',
      links: [['论文摘要', 'https://arxiv.org/abs/2606.29537'], ['项目演示与失败案例', 'https://osworld-v2.xlang.ai/']]
    },
    {
      concept: '感知历史 · 内部状态', level: '工程实践选读',
      title: '任务做了一半，AI 怎样接着做？',
      source: 'Anthropic · Effective harnesses for long-running agents', date: '2025-11-26', type: '官方工程文章',
      description: '文章研究跨多个上下文窗口的编程任务：通过初始化环境、进度记录和测试，让后续会话能够继续推进，而不是每次重新猜测工作做到哪里。',
      connection: '联系 AIMA 第 2 章中“利用感知历史维护内部状态”的思路：眼前的文件并不一定告诉我们全部历史。现代 Agent 可以借助外部记录恢复任务状态；这是一种概念联系，并非两种系统完全等同。',
      guide: '选读 “The long-running agent problem” 和 “Getting up to speed”；代码和安装步骤可以跳过。',
      question: '机器人重启后只记得“现在在教学楼”，还需要知道什么，才能继续送书？',
      answer: '例如是否已经取书、书要交给谁、最新目的地、是否已交付。记录也可能过时，因此还需要检查现场状态。保存一段文字，并不等于获得了准确、完整的记忆。',
      boundary: '文章介绍一种工程方案，不意味着所有 Agent 都具有可靠的长期记忆，也不意味着写日志就能保证任务成功。',
      links: [['阅读原文', 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents']]
    },
    {
      concept: '绩效度量 P · 理性行动', level: '2026 工程选读',
      title: 'AI 说“完成了”，我们该相信吗？',
      source: 'Anthropic · Demystifying evals for AI agents', date: '2026-01-09', type: '官方工程文章',
      description: '文章区分执行过程和环境中的最终结果，并讨论程序检查、模型评价与人工评价如何配合。智能体的自我报告，不能代替任务完成的证据。',
      connection: '回到 PEAS 中的 P：先定义什么算做好，再讨论用什么方法实现。绩效度量是评价任务结果的标准，不是“模型说自己有多自信”；多次测试还可以检查结果是否稳定。',
      guide: '选读 “The structure of an evaluation” 和 “Types of graders for agents”；先理解过程、结果、评判标准三个概念。',
      question: '机器人发来“书已送达”。如果你是验收者，还想核对哪两项证据？',
      answer: '例如接收方确认、交付地点与任务一致，也可以核对时间和书的身份。证据要与任务标准对应；不能只因为机器人说得流畅，就认为它完成了任务。',
      boundary: '用大模型评价也可能出错，需要明确标准并与人工判断校准。课程中的 AI 反馈即使将来接入，也不应自动成为正式成绩。',
      links: [['阅读原文', 'https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents']]
    }
  ];
  const section = document.createElement('section');
  section.id = 'frontier';
  section.className = 'frontier-readings textbook-extras';
  section.setAttribute('aria-labelledby', 'frontier-title');
  section.innerHTML = `<p class="eyebrow">从课本到前沿</p><h3 id="frontier-title">今天的 Agent，仍在回答这些问题。</h3><p>谁在感知？能采取哪些行动？不知道什么？怎样才算做好？带着本课的概念，看研究者如何设计和检验智能体。</p><p class="frontier-meta">自愿选读 · 不纳入考试 · 无需提交或注册账号<br>资料核验：2026-09-17；每张卡片单独标注发布日期。</p><div class="frontier-start"><strong>只选一篇也可以。</strong>想直观看到 Agent 怎么行动，先看第 1 张；想看近期研究，选第 2 张。建议用 5–10 分钟阅读指定片段，再回答卡片上的一个问题。英文资料可借助翻译，但重要结论仍请对照原文。</div>`;
  readings.forEach((r, i) => {
    const card = document.createElement('details');
    card.className = 'frontier-card';
    if (i === 0) card.open = true;
    card.innerHTML = `<summary><span class="frontier-kicker">${String(i + 1).padStart(2, '0')} · ${r.level}</span><span class="frontier-name">${r.title}</span><span class="frontier-concept">${r.concept}</span></summary><div class="frontier-body"><p class="frontier-source">${r.source}<br><time datetime="${r.date}">${r.date}</time> · ${r.type}</p><p><strong>研究在做什么</strong>${r.description}</p><p><strong>与课本的连接 · 课程解读</strong>${r.connection}</p><p><strong>先读哪里</strong>${r.guide}</p><div class="frontier-links">${r.links.map(([label, href]) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join('')}</div><div class="frontier-question"><p><strong>带着一个问题读</strong>${r.question}</p><details class="support"><summary>想过之后，查看参考思路</summary><p>${r.answer}</p></details></div><p class="frontier-boundary"><strong>不要过度推断：</strong>${r.boundary}</p></div>`;
    section.append(card);
  });
  pagination.before(section);
  const nav = document.querySelector('.lesson-nav nav');
  if (nav) {
    const link = document.createElement('a');
    link.href = '#frontier'; link.textContent = '前沿选读'; nav.append(link);
  }
  if (location.hash === '#frontier') requestAnimationFrame(() => section.scrollIntoView());
})();
