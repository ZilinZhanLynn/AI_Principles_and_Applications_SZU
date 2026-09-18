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
