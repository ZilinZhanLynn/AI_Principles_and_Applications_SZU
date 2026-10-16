# 第 2 课图片与演示来源

更新：2026-09-18。

## 原创吸尘器 PEAS 配图

- 文件：`vacuum-peas.png`（1536 × 1024）。
- 使用内置图像生成工具生成，已逐项检查图中文字与 PEAS 对应关系；不是产品照片，不代表特定型号。
- P 是评价标准，不是硬件；图中 A / S 指示的是执行与感知两类部件，具体硬件仅作教学示意。
- 生成模式：内置工具；未调用教师或学生的模型 API。

### 生成提示词

Use case: scientific-educational. Create an original Chinese undergraduate AI textbook-style infographic for a white university course website, aspect ratio landscape 3:2. Theme: vacuum-cleaning robot and PEAS. Center: polished but simple isometric technical illustration of a round white robot vacuum on a pale warm-gray living-room floor, small dust crumbs in front, a burgundy sensor cap, two visible wheels and a side brush; a chair leg as obstacle. No brand. Four spacious editorial callout panels around the central illustration, with thin leader lines: top left P pointing to a separate small checklist icon NOT a physical part, top right E pointing to floor/room/obstacle, bottom left A pointing to wheels/brush, bottom right S pointing to sensor cap/front sensor. Exact Chinese text only, crisp large typography: Title '吸尘器的 PEAS'. Panel 1 'P 绩效度量' then '清洁程度 · 用时 · 能耗'. Panel 2 'E 环境' then '地面 · 灰尘 · 障碍物'. Panel 3 'A 执行器' then '驱动轮 · 吸尘电机 · 边刷'. Panel 4 'S 传感器' then '测距 · 碰撞 · 灰尘检测'. Use muted burgundy #861b48, charcoal, warm white, muted teal details, very legible teaching figure with lots of breathing room, no decorative paragraphs, no watermark, no footer. Important scientifically: P is an external evaluation criterion, not a robot component. Sensors read environment, actuators act; this is illustrative hardware, not a claim every vacuum contains these exact sensors.

## 教材原图

来源为教师提供的 `artificial-intelligence-a-modern-approach.pdf`，Russell & Norvig, *Artificial Intelligence: A Modern Approach*，第 2 章。按这份文件核对页码，其他版本可能不同。

| 本地文件 | 教材图号 | 书内页码 | PDF 页码 | 内容 |
| --- | --- | --- | --- | --- |
| aima-fig-2-1.png | 2.1 | 55 | 56 | 智能体通过传感器、执行器与环境交互 |
| aima-fig-2-9.png | 2.9 | 68 | 69 | 简单反射智能体 |
| aima-fig-2-11.png | 2.11 | 70 | 71 | 基于模型的反射智能体 |

仅提取三幅图及其原始图注，不改写图内内容；中文解读为课程补充。教材图版权归原权利人所有，本记录不赋予额外转载许可。公开发布前由教师确认使用范围；本次未推送或发布。

## 动态演示

两房间吸尘器演示为课程原创网页组件，借鉴教材第 2 章吸尘器世界的概念；不是教材原始动画或真实机器人视频。页面默认不播放，可单步观察。

- 感知：当前位置与该格是否脏；不读取另一格的真实状态。
- 简单反射策略：脏则吸尘，否则换格。
- 带记忆策略：更新已观察格子的状态；当前脏则吸尘，两格记录都干净则停止，否则换格。
- 假设：动作可靠、地面不会重新变脏。记忆在下一次感知时更新，因此行动后显示的是尚未刷新的上一次感知与记录。
- 全局图仅供学生理解，不是机器人可用的全局传感器。

---

# 第 3 课课堂播放页来源

更新：2026-09-22。

## 课程内图与互动

- `lesson-3-live.html` 中的案例卡、六项定义交互、八数码棋盘和“候选—评估—选择”说明均为本课程原创的功能性教学图。
- `search-problem-hero-v1.png` 是使用内置图像生成工具制作的课程原创主视觉：以水罐、状态路径、城市道路和八数码的抽象组合引入“搜索问题”。图中不含可读文字、品牌或教材原图；仅作导入视觉，不能替代课件中用于精确讲解的算法图。
- 播放页不嵌入课件截图。罗马尼亚道路图和树搜索图均由课程网站重新绘制，课件只用于核对其中的概念、城市关系和教学顺序。
- 罗马尼亚旅行的状态空间、动作、初始状态、目标状态与解的表述，逐项核对课件第 12 页；水罐问题的任务描述与形式化，逐项核对课件第 15、19 页；八数码规则核对课件第 17 页。

## 教材核对

- AIMA 第 4 版第 3 章 §3.1.1：搜索问题的六个组成——状态空间、初始状态、目标状态、动作、转移模型、动作代价函数。
- AIMA 第 4 版第 3 章 §3.3：状态空间图与搜索树的区别；搜索算法以搜索问题为输入，返回解或失败指示。
- 公开网站不额外截取或上传 AIMA 第 3 章整页图片；页面只用短句概述与明确章节标注。教材版权归原权利人所有。

## 前沿材料（均为原站外链）

- OpenAI, *Learning to reason with LLMs*（2024）：https://openai.com/index/learning-to-reason-with-llms/
- Google DeepMind, *AlphaEvolve: A Gemini-powered coding agent for designing advanced algorithms*（2025）：https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/
- Hugging Face Transformers, *Generation strategies*：https://huggingface.co/docs/transformers/generation_strategies

外部文章仅作选读和课堂讨论，不作为考试材料；课程页面使用短引文并提供原文链接，不复制整篇文章、完整配图或视频。

## 补充视频

- Bilibili：`BV1Fx411u7GW`，《伯克利 CS188 人工智能导论（Spring 2016）》中的 “Search Overview”。页面以播放器嵌入，并保留备用链接：https://www.bilibili.com/video/BV1Fx411u7GW/
- 视频用于帮助学生先建立“搜索问题”的直观印象；六项定义、状态空间图和搜索树仍以教师课件与 AIMA 第 3 章为准。
