# Essay task and prompts

## Extract and confirm the task

Use the current model to extract an essay task from the user's original words.
Accept a complete exam prompt, title only, natural-language request, project only,
or an already structured task.

Create this pending object before background discovery:

```json
{
  "source_text": "用户输入的完整原文",
  "topic": "论文标题",
  "task_requirements": [
    {"id": "req_1", "content": "第一项论述要求"}
  ],
  "structure_requirements": [],
  "other_constraints": [],
  "source_type": "exam_prompt",
  "confidence": "high",
  "status": "pending_confirmation",
  "target_words": {"min": 2000, "max": 2500}
}
```

Supported `source_type` values are `exam_prompt`, `title_only`,
`model_suggested`, and `manual`. Supported status values are
`pending_confirmation`, `confirmed`, and `rejected`.

Preserve explicit structural requirements and other limits from the original
input in `structure_requirements` and `other_constraints`. Keep the task
`pending_confirmation` while reading the local candidate profile, local project
list, and any attached or @-referenced resume. Do not ask the user to confirm
the task or provide project background before this discovery finishes.

After selecting a project and preparing any necessary supplement plan, show one
consolidated confirmation containing the topic, requirements, target range,
selected project name and source, and key proposed supplements. Ask for
confirmation or correction once. Never infer confirmation from silence.

For `title_only`, label confidence as `medium` and say:

> 这是根据标题推测的写作要求。如有完整题目原文，应优先粘贴原文。

When the user provides only a project, first inspect all discovered project
material, then suggest two or three suitable essay titles. Include the title
choice in the consolidated confirmation. Never silently choose a title and
generate an essay.

Only after the consolidated confirmation set `status` to `confirmed` and save
staged resume-derived data.

## First-generation prompt

Use one concise prompt. Substitute the returned `essay_brief` and the selected
local `project_profile`.

```text
请根据下面的论文题目、已确认的论述要求、文章结构和用户项目背景，书写一篇完整的系统架构设计师考试练习论文。

写作时请充分发挥语言组织和项目叙事能力，不要机械罗列要求，不要把文章写成检查清单。
论文任务单中的 focus 用于帮助取舍素材，不要逐项照抄；writing_requirements 是必须全部满足的硬要求。用户确认事实是不可修改的锚点；仅可使用论文任务单中列出的合理补全或示例项目设定，不得自行扩大补全范围。
project_anchors 是全文唯一的项目事实主轴。不能只在摘要中写项目名称，然后在正文改写成脱离该项目的通用技术文章；也不能把候选人画像中属于其他项目的能力或技术直接移入当前项目。

必须遵守：
1. 完整回答所有已确认的 task_requirements。
2. 按 practice_context 使用真实经历、合理补全或示例项目模式。
3. 不得修改用户已确认的项目时间、规模、本人岗位、技术架构和实施效果。
4. 全文控制在指定字数范围。
5. 直接输出论文标题、摘要、正文和结尾，不附加练习设定说明、补全清单、事实来源或其他交卷外内容。
6. 不输出大纲、分析过程、评分或写作建议。
7. 理论说明简洁，重点放在项目实践。
8. 使用第一人称，自然体现本人承担的工作。
9. 合理补全必须符合 fact_boundaries，并与项目规模、年代、技术栈和本人角色一致。
10. 不得把模型补全或示例项目设定写成经过核实的现实事实。
11. 结尾必须从项目上线或验收后的运行情况开始，用自然连贯的一至两段继续写关键量化效果、客户或使用单位评价、个人收获、一项轻微不足及对应改进；技术改进后必须另接一句启发式或再接再厉式收束，回扣项目、题目或架构方法，不能停在整改清单，也不能只写空泛口号。
12. 正文不得用“首先、其次、第三、第四、第五、第六”或“一是、二是、三是”等连续序号串联主要论点，应按问题、判断、取舍、行动和结果自然推进，也不要机械替换成另一组固定连接词。
13. 摘要必须用一个自然段完整写出八项内容：项目开始时间、项目名称或类型、主要功能、本人担任的系统架构设计师岗位、核心职责、实施成果、建设历时、客户或领导评价。建设历时按已确认起止时间如实计算；只有示例项目或允许补全项目时间时才优先设置为一至三年。不得用技术栈罗列代替主要功能。
14. 正文第一段必须单独用380—470字写项目背景，完整交代建设或改造原因、投入与历时、本人岗位职责、主要功能与核心技术。新建项目写清为什么立项和关键质量诉求；老系统改造写清原系统痛点、为什么必须重构及改造目标。摘要、后续架构权衡、实施措施和效果必须沿用这段背景主轴，不得只堆砌功能和技术。
15. 主体每个主要论点都必须回到同一个已选项目，形成“项目场景或问题—本人判断与动作—实施措施—结果证据”的闭环；如果题目需要合理补全，应将补全嵌入现有项目边界，不能取代真实项目主线。

论文任务单：
{{essay_brief}}

用户项目背景：
{{project_profile}}
```

Do not add scoring details, dimension scores, complete failure-rule lists,
keyword-density rules, fixed sentence patterns, sentence-by-sentence steps,
internal rule names, or rule IDs.

## Revision prompt

Use only the actual `repair_requirements` returned after checking.

```text
请在保持原有项目事实、练习设定、总体结构和自然语言风格的前提下，修改下面的完整论文。

只处理以下问题：
{{repair_requirements}}

要求：
1. 不改变已确认的项目事实和已列出的练习设定。
2. 不把论文改成条目式答案。
3. 不增加本次 practice_context 未列出的关键项目设定。
4. 保持全文自然连贯。
5. 修改后直接输出完整论文。
6. 不输出修改说明和评分。
7. 若修订要求涉及结尾，必须补齐上线运行、量化效果、客户评价、个人收获、轻微不足和对应改进，并在技术改进后另接一句与项目或架构主题相关的启发式、再接再厉式收束。
8. 若修订要求涉及摘要，只重写摘要并补齐项目八要素，不得为了凑建设历时而修改已确认起止时间。
9. 若修订要求涉及项目背景，只重写正文第一段并保持其原有篇幅；根据项目性质补齐新建立项动因，或老系统痛点与重构原因，同时保留投入、历时、岗位职责、功能和技术等已确认事实。
10. 不要为了满足修订要求而调整全文字数，字数在最后单独一轮处理。

原论文：
{{essay}}
```

Do not rerun the complete first-generation rule set during revision.

## Semantic self-review prompt

The Server never judges these items. Run this after the rule gate passes,
substituting the returned `semantic_review`. Judge only; do not rewrite in the
same step.

```text
请对下面这篇论文逐项做语义评审。你刚刚生成或修改过这篇论文，评审时必须按对待他人作品的标准执行。

对每一项给出：
- verdict：satisfied、partial 或 missing
- evidence：论文中逐字出现的原句或原句片段，不得改写、概括或拼接
- reason：一句话说明判断依据

硬性规则：
1. 判 satisfied 或 partial 必须给出原文证据句；找不到可引用的原句就必须判 missing。
2. 题目要求的字面词语出现在论文中不等于已回应，必须有围绕本项目展开的具体内容。
3. 在摘要或开头照抄题目要求的句子不能作为证据。
4. 只判定，不修改论文。
5. 直接输出逐项结果，不输出总评和分数。

评审项：
{{semantic_review}}

论文：
{{essay}}
```

Any item whose verdict appears in `blocking_verdicts` means the essay is not
finished. Collect those items' `repair_template` values and feed them into the
revision prompt as `repair_requirements`.

## Length adjustment prompt

Use this only after both gates pass, substituting
`length_adjustment.instructions`.

```text
请只调整下面这篇论文的篇幅，不改变任何内容判断。

调整要求：
{{length_instructions}}

要求：
1. 不新增、不删除、不修改任何项目事实、数据和练习设定。
2. 不删除任何已回应的论述要求，不删除架构权衡、量化结果和结尾闭环。
3. 扩写只能展开已有内容的决策理由和实施细节，不得重复已有句子，不得增加空话。
4. 压缩只能删减次要理论和枝节叙述。
5. 直接输出调整后的完整论文，不输出说明。

原论文：
{{essay}}
```
