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
4. Cross-check every project against the candidate profile before selection. Select the only local project automatically only when its industry, project type, period, role, and stack plausibly match the profile. Treat the bundled `project-profile-example.json` as a sample project even if old metadata labels its fields `user_confirmed`. If the only project is a sample or materially conflicts with the profile, do not select it: recover resume-derived projects first. When several local or resume-derived projects exist, rank them against the pending task and recommend the strongest one by project name; never merge facts from different projects and never expose project IDs.
5. Read [practice-modes.md](references/practice-modes.md) and default to `reasonable_supplement`. Run `project prepare` for the selected or staged project. Treat `supplementable_fields` as material the Skill may complete, not as blockers. Ask for minimal project anchors only when neither local data nor the resume provides them.
6. Compare the pending task with the selected project. Build the smallest plausible supplement plan for unsupported topic material. Confirm only material additions such as a new platform, architecture style, or pilot scope. Under `auto`, mark additions `model_supplemented`, `confidence: plausible`, and `confirmed: false` without a separate question.
7. Show one consolidated confirmation containing the topic and requirements, selected project name and source, target length, and any proposed supplements. Do not ask separate “task mode” or generic project-background questions when the information was already found. A title-only extraction remains `pending_confirmation` and must include the inference warning.
8. After explicit confirmation, set the task status to `confirmed`, mark proposed key supplements confirmed, and save any staged resume-derived profile or project locally. The Server rejects every other task status with `TASK_NOT_CONFIRMED`.
9. Send the confirmed `essay_task`, practice context, supplements, and selected project to `essay generation-brief`. Verify that `project_anchors` names the selected project and carries its real responsibilities, functions, technologies, problems, measures, and results. If it does not, stop and repair the project record instead of generating. Use the concise first-generation prompt from the reference file with the returned brief and local project profile.
10. Let the current model generate the full essay. The default range is 2,000–2,500 non-whitespace characters. Return title, abstract, body, and conclusion—not analysis, outline, score, or advice.
11. Treat completion as two gates plus one length pass. Run `essay check` with the same confirmed task, project, practice context, target range, and full essay. Exit code `3` means content issues remain, `4` means only the length is off, `0` means the rule gate passed.
12. Rule gate: while `passed` is false, use only `repair_requirements` in the concise revision prompt, rewrite the complete essay, and recheck. Repeat for at most three repair rounds. Length never consumes a repair round.
13. Semantic gate: after the rule gate passes, apply the returned `semantic_review` yourself using the self-review prompt in the reference file. Judge every item, quote a verbatim sentence from the essay as evidence, and treat any `blocking_verdicts` result as unfinished. Rewrite using the matching `repair_template`, then rerun both gates. At most three semantic rounds.
14. Length pass: once both gates pass, apply `length_adjustment.instructions` in a final trim-or-expand rewrite that changes no facts, then rerun `essay check` to confirm `in_range` is true.
15. Return the complete essay only when the rule gate passes, every semantic item is `satisfied`, and the length is in range. If the rounds run out, report the remaining blockers instead of labeling the draft final. Return only the finished title, abstract, body, and conclusion; never append a practice-setting note, supplement list, or provenance explanation.

Read [workflow.md](references/workflow.md) when executing the full generation or rewrite workflow.
Read [resume-import.md](references/resume-import.md) when the user attaches or @-references a resume.
Read [practice-modes.md](references/practice-modes.md) whenever project material is incomplete or does not directly cover the essay topic.

## Optimize an existing essay

Require a confirmed `essay_task`, then call `essay optimization-brief` with the project, practice context, complete essay, and optimization type. Rewrite the complete essay using only the returned strategy. Never change confirmed user facts or introduce unmarked practice settings.

Supported optimization types are documented in [output-schema.md](references/output-schema.md).

## Check or review

- `essay check` covers two different things. Its `issues` are objective rule findings: project-fact consistency, key knowledge for matched topics, the mandatory abstract, background, tradeoff, conclusion and transition techniques, personal work, and exactly repeated sentences. Its `semantic_review` is a rubric you must judge yourself; the Server never scores it.
- Requirement coverage, topic relevance, empty or slogan-like padding, and the theory ratio are semantic judgments. Never treat a keyword appearing in the essay as proof that any of them is satisfied.
- Use `essay review` only when the user explicitly requests a score or diagnosis. It returns dimensions, the objective findings already mapped to the dimension each one affects, and the semantic rubric—but no scores. Assign each dimension a score yourself, with evidence, following `scoring_instructions`.
- Describe scores as training feedback, never as an official result.

## Safety

Read and follow [safety-boundaries.md](references/safety-boundaries.md). Refuse live-exam answer generation and misrepresenting practice supplements or sample projects as verified real-world experience.

## Client

Use `node "$SKILL_DIR/scripts/ruankao_client.mjs" --help` for commands. The client requires Node.js 18+ and stores the profile in `~/.ruankao/profile.json`, projects in `~/.ruankao/projects`, and the stable device ID in `~/.ruankao/device_id`. `RUANKAO_CONFIG_DIR` may override this directory. Local CRUD commands do not require the Server or License; protected analysis commands read the License Token from the environment and send only the structured data needed for that request.
