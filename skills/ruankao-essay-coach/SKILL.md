---
name: ruankao-essay-coach
description: Extract and confirm essay tasks, organize resume-derived project facts, and generate, rewrite, optimize, or review complete Chinese essays for the Ruankao system architect examination. Use for complete prompts, titles, attached or @-referenced resumes, project-material organization, full essay generation, consistency checks, optimization, or optional training scores. Do not use for a live examination, impersonation, guaranteed-pass claims, or presenting model-supplemented settings as verified facts.
---

# Ruankao Essay Coach

Use the bundled Node.js client to keep candidate and project data on the
customer's machine and obtain a concise brief from the stateless Server. Let
the current model do the writing; do not turn the brief into a checklist.

## Configure

Resolve `SKILL_DIR` to the directory containing this file. The client defaults
to `https://api.bindvault.me/ruankao/api/v1` and requires:

```bash
export RUANKAO_LICENSE_TOKEN="your-license-key"
node "$SKILL_DIR/scripts/ruankao_client.mjs" license status
```

Set `RUANKAO_API_BASE_URL` only to override the hosted API. Node.js 18+ is
required. Local data lives under `~/.ruankao` unless
`RUANKAO_CONFIG_DIR` is set.

## Generate an essay

1. Confirm that the request is for practice, not a live examination. Read [essay-task-and-prompts.md](references/essay-task-and-prompts.md) and extract a pending task without interrupting the user yet.
2. Run `profile get` and `project list`. When a resume is attached or @-referenced, show the privacy notice in [resume-import.md](references/resume-import.md) before reading its contents; the notice is informational and needs no separate confirmation. Then inspect it and rank separate projects against the topic; never merge projects or expose project IDs.
3. Read [practice-modes.md](references/practice-modes.md). Default to reasonable supplementation, preserve all confirmed facts, and propose only the smallest topic-specific additions. Ask for project anchors only when neither local data nor the resume supplies them.
4. Show one consolidated confirmation with the topic, requirements, selected project name, target length, and material supplements. After explicit confirmation, save staged resume data and mark the task confirmed.
5. Call `essay generation-brief`. Verify that `project_anchors` belongs to the selected project, then use the concise first-generation prompt. Keep the 300–330 / 400 / 400 / 1,000–1,200 / 300–400 essay framework while giving the model broad freedom over wording and paragraph flow.
6. Before showing any draft, perform one silent whole-essay quality pass. Preserve the hard constraints: answer the task, keep confirmed facts consistent, stay within the requested length, naturally develop one or two architecture tradeoffs, and end with one harmless shortcoming plus its improvement. Never expose “架构权衡一/二” or “方案A/B/C” labels.
7. Call `essay check` once for objective conflicts, exposed labels, exact repetition, and total length. If needed, combine all returned corrections into one whole-essay polish and recheck once. Do not start multi-round keyword repair loops.
8. Return only the title, abstract, body, and conclusion. Do not append the brief, analysis, score, supplement list, or provenance note.

Read [workflow.md](references/workflow.md) for request shapes and project
selection details.

## The two non-negotiable scoring techniques

- Architecture tradeoff: in one or two project decisions, make the reader understand why this design fit the current constraints, why another design was not used, and what cost was accepted. Show that architecture has no context-free optimum, only tradeoffs. Keep it inside natural project narration.
- Harmless shortcoming: the conclusion must include one minor, improvable limitation that does not overturn the main solution. Prefer remaining performance or network-transmission optimization, including a gradual text-to-binary protocol evaluation when it fits the project, then give the next action and close naturally.

## Optimize or review

For optimization, require a confirmed task and call `essay optimization-brief`,
then rewrite the full essay without changing confirmed facts. Use `essay review`
only when the user explicitly asks for diagnosis or a training score. Review is
model-judged; the Server does not issue an official score.

## Safety

Read and follow [safety-boundaries.md](references/safety-boundaries.md). Never
misrepresent supplements or sample projects as verified real-world experience.
