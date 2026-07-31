# Full workflow

## Confirmed essay task

Extract the task from the user's original input before loading project material.
Show the pending topic, task requirements, target range, and explicit limits to
the user. Continue only after explicit confirmation.

If the input is title-only, warn that the requirements are inferred. If the
input contains only a project, suggest two or three titles and wait for the
user's choice. Never generate from a pending, rejected, or silently inferred
task.

## Candidate profile

Call `profile get` before asking background questions. It reads the customer's
local `~/.ruankao/profile.json`. Reuse the confirmed profile for every later
topic.

When the profile is absent or incomplete, ask no more than three questions in
one turn. Save confirmed answers with:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" profile update candidate-profile.json
```

Use `profile prepare` to obtain the next questions and completion percentage.
Keep candidate background separate from project facts.

## Project profile

Run `project list` before asking the customer about projects. If one project
exists, use it automatically. If several exist, ask the customer to choose by
project name. Keep `proj_xxx` identifiers internal and never require the
customer to know, copy, or enter one.

Require a reusable project profile containing:

- project name, industry, start and end date;
- budget and team size;
- user role and concrete responsibilities;
- project goal and main modules;
- architecture and quality attributes;
- at least two authentic problems;
- measures corresponding to those problems;
- at least one quantified result.
- launch and current operation status;
- authentic customer or user feedback;
- personal lessons learned;
- remaining shortcomings and corresponding improvement actions.

Create the profile:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" project create project.json
```

This writes a separate JSON file under the customer's local
`~/.ruankao/projects` directory.

Run preparation:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" project prepare proj_xxx
```

Ask each returned question before continuing when `ready` is false.

## Generation brief

Create a JSON request:

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
    "target_words": {"min": 2100, "max": 2200}
  },
  "project_profile_id": "proj_xxx"
}
```

The model creates this temporary request itself after resolving the local
project by name. Do not ask the customer to create the JSON file or provide the
internal project ID.

Run:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" essay generation-brief request.json
```

Generate the complete essay according to:

- confirmed `task_requirements`;
- the selected local project profile;
- `total_words`;
- the concise `structure` and `writing_requirements`.

Use the first-generation prompt in `essay-task-and-prompts.md`. Do not add
scoring rules, internal rule identifiers, fixed sentence patterns, or detailed
failure checklists.

Do not expose the raw generation brief in the final answer.

## Consistency repair

Write the generated essay into a JSON request:

```json
{
  "essay_task": {
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
    "target_words": {"min": 2100, "max": 2200}
  },
  "project_profile_id": "proj_xxx",
  "essay": "完整论文正文"
}
```

Run:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" essay check check.json
```

The Server returns at most three high-priority and three medium-priority issues.
Use only `repair_requirements` in the revision prompt. Rewrite the complete
essay while preserving its unaffected structure, facts, and natural style.

## Completion

Return the repaired complete essay. The Server does not store generation
history or the full essay.
