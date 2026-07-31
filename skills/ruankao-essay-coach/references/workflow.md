# Full workflow

## Discover before asking

Extract a pending task from the user's original input, but do not show a
confirmation yet. Use the pending topic and requirements to evaluate available
project material.

Immediately call `profile get` and `project list` before asking any background
question. Also inspect attached or @-referenced resumes. Reuse confirmed local
data; when a resume is present, follow `resume-import.md` to stage a candidate
profile and separate project candidates without saving them yet.

If one project exists, select it automatically only after checking that its
industry, project type, period, role, and stack plausibly match the candidate
profile. Never auto-select the bundled example project or a sole project with
no meaningful profile overlap. Recover projects from an available resume
first. If several local or
resume-derived projects exist, rank them by relevance to the pending task and
recommend the strongest by name. Never merge projects and never ask the user
for a `proj_xxx` identifier.

Only when local data and the resume both lack the minimum project anchors may
the Skill ask for project background. Ask at most three anchor questions in one
turn, or offer a clearly labeled sample project.

## Candidate profile

The profile describes the person; project records describe individual
projects. Keep them separate. Stage resume-derived values until consolidated
confirmation. Save confirmed profile values with:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" profile update candidate-profile.json
```

Run `profile prepare` after saving. An incomplete candidate profile does not
block generation when the selected project already supplies role and technical
anchors.

## Project profile

Select the practice mode from `practice-modes.md`. Default to
`reasonable_supplement`; do not ask the user to choose a mode unless they have
requested strict authenticity, automatic completion, or a sample project.

For the default mode, require only these anchors before continuing:

- project name or type;
- user role;
- known architecture or primary technology stack.

Use a resume role timeline and confirmed typical team size as supporting
context, but do not silently convert them into exact project dates or team
size. When project period or team size is absent, place the smallest plausible
value in the consolidated supplement plan instead of rejecting the project.

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

Before generation, ensure the project can support a 400–450-character first
body paragraph: project motivation or legacy-system pain and refactoring
reason, investment, duration, role and responsibilities, main functions, and
core technology. Infer new-build versus renovation only from available facts.
When these details are absent in `reasonable_supplement`, include the smallest
plausible additions in the same supplement plan and consolidated confirmation;
do not interrupt the user with a separate background questionnaire.

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

Ask only returned `questions` when `ready` is false and no discovered source
already answers them. Do not ask about every `supplementable_field`. Instead,
compare the pending task with the known
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
`auto` strategy, use `confirmed: false` and retain the source only for internal
consistency checks.

In `sample_project` mode, create one coherent local project, set
`practice_mode: sample_project`, and mark generated facts with source
`sample_project`. Identify the selected mode during consolidated confirmation,
but do not append a mode or provenance note after the finished essay.

## Consolidated confirmation

After discovery and gap analysis, show one confirmation containing:

- pending topic, task requirements, explicit limits, and target length;
- selected project name and whether it came from local storage, the resume, or
  a sample-project proposal;
- the material already supported by that project;
- only the key model-supplemented settings that require approval.

Do not ask separate questions about task mode or project background when those
answers were discovered. For a title-only task, include the inference warning.
If several projects remain equally suitable, include a short project-name
choice in this same confirmation.

After explicit confirmation, set the task status to `confirmed`, mark approved
supplements confirmed, then save staged profile and project data. Never call a
generation endpoint with a pending or rejected task.

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
    "target_words": {"min": 2000, "max": 2500}
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
- `project_anchors`, which must remain the single factual spine from abstract
  through conclusion;
- `practice_context`, `practice_supplements`, and `fact_boundaries`;
- `total_words`;
- the concise `structure` and `writing_requirements`.

Use the first-generation prompt in `essay-task-and-prompts.md`. Do not add
scoring rules, internal rule identifiers, fixed sentence patterns, or detailed
failure checklists.

Do not expose the raw generation brief in the final answer.

## Completion gates

Completion has two gates and one length pass, in this order. The Server judges
only the first. Never present a draft as final because one of them passed.

| Stage | Judged by | Signal | Rounds |
| --- | --- | --- | --- |
| Rule gate | Server | `passed`, exit `3` | at most 3 |
| Semantic gate | Current model | `semantic_review` verdicts | at most 3 |
| Length pass | Server measures, model rewrites | `length_adjustment`, exit `4` | 1, at the end |

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
    "target_words": {"min": 2000, "max": 2500}
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

### Rule gate

`issues` holds at most three high-priority and three medium-priority objective
findings: project-fact conflicts, key knowledge for a matched topic, the
mandatory abstract, background, tradeoff, conclusion and transition techniques,
personal work, and exactly repeated sentences. Use only `repair_requirements` in
the revision prompt and rewrite the complete essay while preserving its
unaffected structure, facts, and natural style. Exit code `3` means unfinished.
Recheck after each rewrite, for at most three repair rounds.

The Server does not judge requirement coverage, topic relevance, empty padding,
or the theory ratio. A passing rule gate is not a passing essay.

### Semantic gate

After `passed` is true, take `semantic_review` from the same response and apply
the self-review prompt in `essay-task-and-prompts.md`. It contains one item per
confirmed task requirement plus `topic_relevance`, `substance`, and
`theory_ratio`.

Judge every item as `satisfied`, `partial`, or `missing`, and quote a verbatim
sentence from the essay as evidence. An item without quotable evidence is
`missing`, never `satisfied`. A requirement restated in the abstract is not
evidence that the essay answered it.

For every item whose verdict is in `blocking_verdicts`, use that item's
`repair_template` as a repair requirement, rewrite the complete essay, then
rerun the rule gate and this gate. At most three semantic rounds.

### Length pass

Length never consumes a repair round. Handle it once, after both gates pass:
apply `length_adjustment.instructions` with the length adjustment prompt, then
rerun `essay check` to confirm `in_range` is true and no content issue
reappeared. Exit code `4` means only the length is still off.

## Completion

Return the complete essay only when the rule gate passes, every semantic item is
`satisfied`, and the length is in range. If the rounds run out, report the
remaining blockers instead of presenting the draft as final. Return only the
title, abstract, body, and conclusion; never append a practice-setting note,
supplement list, or fact provenance. The Server does not store generation
history or the full essay.

## Optional score

Only when the user explicitly asks for a score, run `essay review`. It returns
the seven dimensions, the objective findings already mapped to the dimension
each one affects, the semantic rubric, and `scoring_instructions`. It returns no
scores. Complete the semantic review first, then assign each dimension a score
with evidence, keeping every deduction on the dimension it actually belongs to.
Present the result as training feedback, never as an official result.
