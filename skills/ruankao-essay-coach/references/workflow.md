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

Select the practice mode from `practice-modes.md`. Default to
`reasonable_supplement`; do not ask the user to choose a mode unless they have
requested strict authenticity, automatic completion, or a sample project.

For the default mode, require only these anchors before continuing:

- project name or type and approximate period;
- user role and approximate team size;
- known architecture or primary technology stack.

Treat other missing fields as supplementable. In `authentic` mode, require a
reusable project profile containing:

- project name, industry, start and end date;
- budget and team size;
- user role and concrete responsibilities;
- project goal and main modules;
- architecture and quality attributes;
- at least two authentic problems;
- measures corresponding to those problems;
- at least one quantified result;
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

Run preparation with the selected mode:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" project prepare proj_xxx reasonable_supplement
```

Ask only returned `questions` when `ready` is false. Do not ask about every
`supplementable_field`. Instead, compare the confirmed task with the known
project and create the smallest coherent supplement plan needed for the essay.

## Practice supplement plan

In `reasonable_supplement` mode, preserve user-confirmed facts and propose
topic-specific additions. Confirm only material settings. A service-mesh plan
for an existing Spring Cloud and Kubernetes project may be:

1. add a late-stage cloud-native governance pilot;
2. pilot Istio in two non-core domains;
3. use traffic governance, canary release, resilience, and observability;
4. expand gradually after validation;
5. assign the user selection, pilot design, and rollout-review work.

Do not claim a full multi-cluster rollout unless supported by the project. Save
confirmed settings to `practice_supplements` with `source:
model_supplemented`, `confidence: plausible`, and `confirmed: true`. Under the
`auto` strategy, use `confirmed: false` and disclose the additions once after
the final essay.

In `sample_project` mode, create one coherent local project, set
`practice_mode: sample_project`, and mark generated facts with source
`sample_project`. Keep the sample label outside the essay.

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
  "project_profile_id": "proj_xxx",
  "practice_context": {
    "mode": "reasonable_supplement",
    "supplement_strategy": "confirm_key_settings",
    "supplements": [
      {
        "field": "service_mesh_pilot",
        "value": "在两个非核心业务域试点 Istio，验证流量治理、灰度发布和可观测性",
        "source": "model_supplemented",
        "confidence": "plausible",
        "confirmed": true
      }
    ]
  }
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
- `practice_context`, `practice_supplements`, and `fact_boundaries`;
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
  "practice_context": {
    "mode": "reasonable_supplement",
    "supplement_strategy": "confirm_key_settings",
    "supplements": [
      {
        "field": "service_mesh_pilot",
        "value": "在两个非核心业务域试点 Istio，验证流量治理、灰度发布和可观测性",
        "source": "model_supplemented",
        "confidence": "plausible",
        "confirmed": true
      }
    ]
  },
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

Return the repaired complete essay. If the check result contains
`supplement_disclosure`, append one concise `练习设定说明` after the essay.
Do not include that note in the essay character count. The Server does not
store generation history or the full essay.
