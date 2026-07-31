# Essay task and prompts

## Extract and confirm the task

Use the current model to extract an essay task from the user's original words.
Accept a complete exam prompt, title only, natural-language request, project only,
or an already structured task.

Create this pending object before asking for confirmation:

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
  "target_words": {"min": 2100, "max": 2200}
}
```

Supported `source_type` values are `exam_prompt`, `title_only`,
`model_suggested`, and `manual`. Supported status values are
`pending_confirmation`, `confirmed`, and `rejected`.

Preserve explicit structural requirements and other limits from the original
input in `structure_requirements` and `other_constraints`. Show the topic, each
requirement, target range, and those explicit restrictions to the user. Ask for confirmation or correction. Never infer
confirmation from silence.

For `title_only`, label confidence as `medium` and say:

> 这是根据标题推测的写作要求。如有完整题目原文，应优先粘贴原文。

When the user provides only a project, suggest two or three suitable essay
titles, wait for a selection, derive the requirements, and ask for confirmation.
Never silently choose a title and generate an essay.

Only after explicit confirmation set `status` to `confirmed`.

## First-generation prompt

Use one concise prompt. Substitute the returned `essay_brief` and the selected
local `project_profile`.

```text
请根据下面的论文题目、已确认的论述要求、文章结构和用户项目背景，书写一篇完整的系统架构设计师考试练习论文。

写作时请充分发挥语言组织和项目叙事能力，不要机械罗列要求，不要把文章写成检查清单。
论文任务单中的 focus 只用于帮助取舍素材，不要逐项照抄，也不要补写项目档案中没有的事实。

必须遵守：
1. 完整回答所有已确认的 task_requirements。
2. 使用用户已经录入并确认的项目背景。
3. 不得擅自修改项目时间、规模、本人岗位、技术架构和实施效果。
4. 全文控制在指定字数范围。
5. 直接输出论文标题、摘要、正文和结尾。
6. 不输出大纲、分析过程、评分或写作建议。
7. 理论说明简洁，重点放在项目实践。
8. 使用第一人称，自然体现本人承担的工作。

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
请在保持原有项目事实、总体结构和自然语言风格的前提下，修改下面的完整论文。

只处理以下问题：
{{repair_requirements}}

要求：
1. 不改变已确认的项目事实。
2. 不把论文改成条目式答案。
3. 不增加用户未提供的关键项目数据。
4. 保持全文自然连贯。
5. 修改后直接输出完整论文。
6. 不输出修改说明和评分。

原论文：
{{essay}}
```

Do not rerun the complete first-generation rule set during revision.
