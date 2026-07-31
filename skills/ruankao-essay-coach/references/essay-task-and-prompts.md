# Essay task and prompts

## Extract and confirm the task

Extract the user's original words into a pending task before project discovery:

```json
{
  "source_text": "用户输入的完整原文",
  "topic": "论文标题",
  "task_requirements": [{"id": "req_1", "content": "论述要求"}],
  "structure_requirements": [],
  "other_constraints": [],
  "source_type": "exam_prompt",
  "confidence": "high",
  "status": "pending_confirmation",
  "target_words": {"min": 2200, "max": 2650}
}
```

Preserve explicit requirements and limits. Keep the task pending while reading
the local profile, projects, and any attached or @-referenced resume. After
project selection and gap analysis, show one consolidated confirmation. Only
explicit user confirmation changes the status to `confirmed`.

Use `论文题目` for user-facing wording. When the input contains a title,
background passage, and numbered requirements, call it `完整考试题目`. Never
call it `练习题`. For title-only input, warn:

> 这是根据标题推测的写作要求。如有完整题目原文，应优先粘贴原文。

## First-generation prompt

Substitute `essay_brief` and the selected local `project_profile`:

```text
请依据下面已经确认的论文题目、项目资料和写作任务，完成一篇系统架构设计师考试论文。

把自己当作有真实项目经验的架构师来写，充分发挥语言组织和项目叙事能力。论文要像一篇完整文章，不要把任务单、项目字段或评分点逐项翻译进正文。project_anchors 是唯一项目主线；用户确认事实不可修改，合理补全不得越过 fact_boundaries。

硬性要求只有以下几项：
- 实质回应全部 task_requirements，使用第一人称，全文围绕同一个项目。
- 全文控制在 total_words 范围内，只输出标题、摘要、正文和结尾。
- 在一至两个关键项目决策中自然凸显架构权衡：为什么这样设计、为什么不用另一种设计、接受了什么代价，体现没有脱离场景的最优解，只有权衡。不得写“架构权衡一/二”或“方案A/B/C”。
- 结尾必须写一项无伤大雅的不足和下一步改进。优先选择仍有性能优化空间、网络传输开销仍可降低，或在兼容现有接口的前提下评估把JSON等文本协议逐步转换为Protobuf等二进制协议；若不符合项目，则选择同等轻微的问题，不能用会推翻主体方案的重大缺陷。

结构以以下大框架为准，但不要写成字段清单：摘要约300—330字，用一个自然段概括项目背景与功能、本人岗位职责、围绕本题的项目概括和项目成果；正文开头约400字，讲清项目背景、系统功能、开发或改造原因、时间规模以及本人地位与职责；随后用约400字直接回答题目知识点和分项要求，承接项目背景并引出主体；项目实践主体约1000—1200字；总结约300—400字，写项目上线运行效果、客户评价、个人收获、轻微不足和改进思路。

输出前只做一次整体通读和润色：检查项目是否一致、题目是否答全、两项核心得分点是否自然成立、语言是否像论文而不是检查清单。缺失内容在本轮补齐后再输出，不要展示中间草稿。

论文任务单：
{{essay_brief}}

用户项目背景：
{{project_profile}}
```

Do not add scoring tables, keyword lists, rule IDs, fixed transitions, or
sentence templates.

## One-pass polish prompt

Use this only when the objective check finds a conflict or length problem, or
the model's whole-essay reading finds a substantive gap. Combine every needed
change into this single pass.

```text
请对下面的完整论文做一次整体润色，不要把它拆成逐条补丁，也不要为了迎合关键词破坏自然表达。

需要纠正的客观问题：
{{repair_requirements}}

篇幅调整：
{{length_instructions}}

润色时同时守住：
- 项目事实和题目主线不变；
- 一至两处架构权衡自然写清现方案、未选方案、依据和代价，不使用评分点标题或A/B/C编号；
- 结尾保留运行效果、评价与收获，并写一项无伤大雅的不足、对应改进和自然收束；
- 直接输出完整论文，不输出修改说明。

原论文：
{{essay}}
```

After this polish, run the objective check once more. Do not enter another
rewrite loop.

## Optional review prompt

Use only when the user explicitly asks for diagnosis or a training score.
Judge the returned `semantic_review` by meaning, not keyword presence. Cite
short original passages as evidence, explain the most important strengths and
weaknesses, and keep any score framed as training feedback rather than an
official result.
