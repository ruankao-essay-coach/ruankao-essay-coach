---
name: ruankao-essay-coach
description: Extract and confirm essay tasks, then generate, rewrite, optimize, and review complete Chinese practice essays for the Ruankao system architect examination using an enduring candidate profile and authentic project experience. Use when the user provides a complete exam prompt, title, natural-language writing request, project background, attached or @-referenced resume, existing essay, or asks for project organization, consistency checks, or an optional training score. Do not use for a live examination, fabricated personal experience, impersonation, or guaranteed-pass claims.
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
2. Read [essay-task-and-prompts.md](references/essay-task-and-prompts.md). Use the current model to extract an `essay_task` from the user's original input.
3. Show the extracted topic, task requirements, length, and explicit restrictions to the user. Do not continue until the user confirms or corrects them. A title-only extraction remains `pending_confirmation`; when no title exists, suggest two or three suitable titles and wait for a choice.
4. After explicit confirmation, set the task status to `confirmed`. The Server rejects every other status with `TASK_NOT_CONFIRMED`.
5. Run `profile get` and reuse a confirmed local candidate profile. When absent, import an attached or @-referenced resume as described in [resume-import.md](references/resume-import.md), or ask at most three questions per turn.
6. Run `project list`. Select the only project automatically, or ask the user to choose by project name when several exist. Keep project IDs internal. If none exists, create an authentic project profile. Never merge projects or invent facts.
7. Run `project prepare` and resolve missing material with at most three questions per turn.
8. Send the confirmed `essay_task` and selected project to `essay generation-brief`. Use the concise first-generation prompt from the reference file with the returned brief and local project profile.
9. Let the current model generate the full essay. The default hard total is 2,100–2,200 non-whitespace characters. Return title, abstract, body, and conclusion—not analysis, outline, score, or advice.
10. Run `essay check` with the same confirmed task, project, target range, and full essay.
11. If `passed` is false, use only `repair_requirements` in the concise revision prompt. Rewrite the complete essay without rerunning all generation rules, then recheck.
12. Return only the final complete essay unless the user explicitly requests diagnosis or scoring.

Read [workflow.md](references/workflow.md) when executing the full generation or rewrite workflow.
Read [resume-import.md](references/resume-import.md) when the user attaches or @-references a resume.

## Optimize an existing essay

Require a confirmed `essay_task`, then call `essay optimization-brief` with the project, complete essay, and optimization type. Rewrite the complete essay using only the returned strategy. Never silently change confirmed task requirements or project facts.

Supported optimization types are documented in [output-schema.md](references/output-schema.md).

## Check or review

- Use `essay check` for confirmed task coverage, key knowledge, project use and consistency, personal work, practice depth, length, relevance, and obvious repetition.
- Use `essay review` only when the user explicitly requests a score or diagnosis.
- Describe scores as training feedback, never as an official result.

## Safety

Read and follow [safety-boundaries.md](references/safety-boundaries.md). Refuse live-exam answer generation and fabricated real-world project experience.

## Client

Use `node "$SKILL_DIR/scripts/ruankao_client.mjs" --help` for commands. The client requires Node.js 18+ and stores the profile in `~/.ruankao/profile.json`, projects in `~/.ruankao/projects`, and the stable device ID in `~/.ruankao/device_id`. `RUANKAO_CONFIG_DIR` may override this directory. Local CRUD commands do not require the Server or License; protected analysis commands read the License Token from the environment and send only the structured data needed for that request.
