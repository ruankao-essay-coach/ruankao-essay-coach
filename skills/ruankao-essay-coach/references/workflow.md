# Full workflow

## Discover before asking

Extract a pending task, then immediately run `profile get` and `project list`
and detect attached or @-referenced resumes. Before reading resume contents,
show the privacy notice in [resume-import.md](resume-import.md) exactly once;
then inspect the resume. Do not ask the user for project background until these
sources have been checked.

Keep the candidate profile separate from project records. Rank projects by
topic fit and recommend by project name. Never merge facts from different
projects, expose `proj_xxx` identifiers, or auto-select the bundled example as
the user's real project.

When a resume is present, follow [resume-import.md](resume-import.md). Stage
resume-derived profile and project records until the consolidated confirmation.

## Select and complete a project

Read [practice-modes.md](practice-modes.md) and default to
`reasonable_supplement`. The minimum anchors are:

- project name or type;
- user role;
- primary architecture or technology stack.

Treat other gaps as material the model may organize or plausibly complete.
Confirm only additions that materially change the project, such as introducing
a new architecture style, platform, or pilot scope. Preserve all confirmed
facts and never enlarge the project's period, scale, customer, contract, or
honors without support.

Use:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" project prepare proj_xxx reasonable_supplement
```

Ask returned questions only when neither local data nor the resume answers
them. Under `auto`, retain `model_supplemented` source metadata internally and
keep every addition within the known period, scale, role, and stack.

## Confirm once

Show one concise confirmation containing:

- the topic, explicit requirements, and target length;
- the selected project name and source;
- only material supplements needing approval.

Say `论文题目已提取` or `完整考试题目已提取`, never `练习题已提取`.
After explicit confirmation, set the task status to `confirmed`, save staged
resume data, and continue. Do not ask separate mode, project, and supplement
questions when one confirmation can cover them.

## Obtain the writing brief

Create a temporary request. The model resolves the internal project ID by
project name; the customer never supplies it.

```json
{
  "essay_task": {
    "source_text": "用户输入的完整题目",
    "topic": "论软件系统架构评估",
    "task_requirements": [
      {"id": "req_1", "content": "概要介绍项目及本人主要工作"},
      {"id": "req_2", "content": "说明架构评估方法及选择原因"},
      {"id": "req_3", "content": "结合项目说明评估过程和改进效果"}
    ],
    "structure_requirements": [],
    "other_constraints": [],
    "source_type": "exam_prompt",
    "confidence": "high",
    "status": "confirmed",
    "target_words": {"min": 2200, "max": 2650}
  },
  "project_profile_id": "proj_xxx",
  "practice_context": {
    "mode": "reasonable_supplement",
    "supplement_strategy": "confirm_key_settings",
    "supplements": []
  }
}
```

Run:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" essay generation-brief request.json
```

Verify that `project_anchors` belongs to the selected project. Generate with
the first-generation prompt in [essay-task-and-prompts.md](essay-task-and-prompts.md).
Treat section targets and focus text as a writing compass, not a form to fill.
The default framework follows: 300–330 characters for the abstract, about 400
for project background, about 400 for task response and transition, 1,000–1,200
for project practice, and 300–400 for the conclusion.

## One quality pass

Before showing the essay, read it once as a whole and polish it in the same
working pass. Check meaning rather than keywords:

1. The essay answers the confirmed task and stays on one project.
2. One or two project decisions naturally explain why the chosen design fit,
   why another design was rejected, and what cost was accepted. The prose must
   show that architecture has no context-free optimum, only tradeoffs.
3. The conclusion includes one harmless shortcoming and a next action. Prefer
   remaining performance or network-transmission optimization, including a
   gradual text-to-binary protocol evaluation when appropriate. The weakness
   must not overturn the main solution.
4. The prose reads like an essay, with no rule labels, field labels, or exposed
   scoring points.

Do not expose the unpolished draft.

## Objective check

Write the polished essay into the request and run:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" essay check check.json
```

The check intentionally covers only objective items:

- project name and confirmed numeric conflicts;
- exposed labels such as `架构权衡一` or `方案A`;
- exactly repeated sentences;
- total non-whitespace character count.

It does not judge prose quality, abstract fields, background keywords,
tradeoff meaning, or conclusion meaning. If the check reports an objective
problem or length adjustment, combine all corrections into the one-pass polish
prompt, rewrite once, and recheck once. Never enter a keyword-repair loop.

Exit code `3` means an objective issue remains, `4` means only length is out of
range, and `0` means the objective check and length passed.

## Complete

Return only the title, abstract, body, and conclusion. Do not append the brief,
fact-source metadata, supplement notes, review process, or score.

## Optional review

Call `essay review` only when the user asks for diagnosis or a training score.
Its semantic items cover project/task grounding and the two core scoring
techniques. The current model judges them from meaning and may quote short
evidence passages. The result is training feedback, not an official score.
