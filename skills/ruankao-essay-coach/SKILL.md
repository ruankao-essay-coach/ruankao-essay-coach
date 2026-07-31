---
name: ruankao-essay-coach
description: Extract and confirm essay tasks, then generate, rewrite, optimize, and review complete Chinese practice essays for the Ruankao system architect examination from authentic facts, constrained practice supplements, or clearly labeled sample projects. Use when the user provides a complete exam prompt, title, natural-language writing request, partial project background, attached or @-referenced resume, existing essay, or asks for project organization, consistency checks, or an optional training score. Do not use for a live examination, impersonation, guaranteed-pass claims, or presenting model-supplemented practice settings as verified real-world facts.
---

# Ruankao Essay Coach

Use the bundled Node.js API client to keep confirmed candidate and project facts on the customer's machine, obtain private generation briefs from the stateless Server, then use the current model to write the complete essay.

## Configure

Resolve `SKILL_DIR` to the absolute directory containing this `SKILL.md`
before running bundled commands. In Claude Code, use
`${CLAUDE_SKILL_DIR}`. In other agents, use the installed skill directory.
Never resolve `scripts/` relative to the user's current project.

The bundled client defaults to the hosted API. Require the License Token:

```bash
export RUANKAO_LICENSE_TOKEN="your-license-key"
```

Set `RUANKAO_API_BASE_URL` only when overriding the default
`https://api.bindvault.me/ruankao/api/v1`.

Run `node "$SKILL_DIR/scripts/ruankao_client.mjs" license status` before the
first protected request.

## Generate a complete essay

1. Confirm the request is for practice, not a live examination.
2. Read [essay-task-and-prompts.md](references/essay-task-and-prompts.md). Extract a pending `essay_task` from the user's input, but do not ask for confirmation yet; use it to discover and rank project material.
3. Before asking the user for background, run both `profile get` and `project list`. Also inspect any attached or @-referenced resume. When a resume is available, read [resume-import.md](references/resume-import.md) and stage both the candidate profile and separate project candidates from it. Do not save staged data yet.
4. Select the only local project automatically. When several local or resume-derived projects exist, rank them against the pending task and recommend the strongest one by project name; never merge facts from different projects and never expose project IDs.
5. Read [practice-modes.md](references/practice-modes.md) and default to `reasonable_supplement`. Run `project prepare` for the selected or staged project. Treat `supplementable_fields` as material the Skill may complete, not as blockers. Ask for minimal project anchors only when neither local data nor the resume provides them.
6. Compare the pending task with the selected project. Build the smallest plausible supplement plan for unsupported topic material. Confirm only material additions such as a new platform, architecture style, or pilot scope. Under `auto`, mark additions `model_supplemented`, `confidence: plausible`, and `confirmed: false` without a separate question.
7. Show one consolidated confirmation containing the topic and requirements, selected project name and source, target length, and any proposed supplements. Do not ask separate “task mode” or generic project-background questions when the information was already found. A title-only extraction remains `pending_confirmation` and must include the inference warning.
8. After explicit confirmation, set the task status to `confirmed`, mark proposed key supplements confirmed, and save any staged resume-derived profile or project locally. The Server rejects every other task status with `TASK_NOT_CONFIRMED`.
9. Send the confirmed `essay_task`, practice context, supplements, and selected project to `essay generation-brief`. Use the concise first-generation prompt from the reference file with the returned brief and local project profile.
10. Let the current model generate the full essay. The default hard total is 2,100–2,200 non-whitespace characters. Return title, abstract, body, and conclusion—not analysis, outline, score, or advice.
11. Treat `essay check` as a mandatory completion gate. Run it with the same confirmed task, project, practice context, target range, and full essay. A failed check returns process exit code `3` even though its JSON remains available.
12. If the command exits nonzero or `passed` is false, use only `repair_requirements` in the concise revision prompt, rewrite the complete essay, and recheck. Repeat for at most three repair rounds. Never present a failed draft as the final essay.
13. Return the complete essay only when the latest check says `passed: true`. If three repairs still fail, report the remaining blockers instead of labeling the draft final. Return only the finished title, abstract, body, and conclusion; never append a practice-setting note, supplement list, or provenance explanation.

Read [workflow.md](references/workflow.md) when executing the full generation or rewrite workflow.
Read [resume-import.md](references/resume-import.md) when the user attaches or @-references a resume.
Read [practice-modes.md](references/practice-modes.md) whenever project material is incomplete or does not directly cover the essay topic.

## Optimize an existing essay

Require a confirmed `essay_task`, then call `essay optimization-brief` with the project, practice context, complete essay, and optimization type. Rewrite the complete essay using only the returned strategy. Never change confirmed user facts or introduce unmarked practice settings.

Supported optimization types are documented in [output-schema.md](references/output-schema.md).

## Check or review

- Use `essay check` for confirmed task coverage, key knowledge, project use and consistency, personal work, practice depth, length, relevance, and obvious repetition.
- Use `essay review` only when the user explicitly requests a score or diagnosis.
- Describe scores as training feedback, never as an official result.

## Safety

Read and follow [safety-boundaries.md](references/safety-boundaries.md). Refuse live-exam answer generation and misrepresenting practice supplements or sample projects as verified real-world experience.

## Client

Use `node "$SKILL_DIR/scripts/ruankao_client.mjs" --help` for commands. The client requires Node.js 18+ and stores the profile in `~/.ruankao/profile.json`, projects in `~/.ruankao/projects`, and the stable device ID in `~/.ruankao/device_id`. `RUANKAO_CONFIG_DIR` may override this directory. Local CRUD commands do not require the Server or License; protected analysis commands read the License Token from the environment and send only the structured data needed for that request.
