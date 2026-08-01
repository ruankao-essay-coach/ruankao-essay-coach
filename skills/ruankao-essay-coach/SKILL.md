---
name: ruankao-essay-coach
description: Extract and confirm essay tasks, organize resume-derived project facts, and generate, rewrite, optimize, or review complete Chinese essays for the Ruankao system architect examination. Use for complete prompts, titles, attached or @-referenced resumes, project-material organization, full essay generation, consistency checks, optimization, or optional training scores. Requires a valid Ruankao license before any workflow step. Do not use for a live examination, impersonation, guaranteed-pass claims, or presenting model-supplemented settings as verified facts.
---

# Ruankao Essay Coach

Use the bundled Node.js client to keep candidate and project data on the
customer's machine and obtain protected Ruankao writing guidance from the
stateless Server. Use the bundled open-source Humanizer guide only for the
mandatory local final-language pass. Never replace a failed Server call with
the model's own offline workflow.

## Mandatory license gate

Resolve `SKILL_DIR` to the directory containing this file. Before parsing the
topic, reading an attachment, inspecting local profile or project data,
creating a temporary request file, or offering a writing plan, run:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" license status
```

The client reads `RUANKAO_LICENSE_TOKEN` and defaults to
`https://api.bindvault.me/ruankao/api/v1`. If the token is missing, invalid,
expired, over its device limit, or the authorization service is unavailable,
stop the current workflow immediately. Return only the activation error and
the command needed to retry. Do not inspect local data, infer a project,
create request files, show a confirmation plan, generate or optimize an essay,
or use bundled knowledge as a fallback.

Run this explicit preflight once per conversation workflow. A successful check
writes a short-lived local session marker bound to the token hash, device, and
Server URL; it never stores the plaintext token. Local profile/project commands
reuse that marker. Do not call `license status` again unless the marker expires,
the user changes the token/device/Server, or a protected endpoint rejects the
authorization.

Every later protected command is also a terminal gate. On any nonzero exit or
authorization failure, stop; never continue locally. Node.js 18+ is required.
Local data lives under `~/.ruankao` unless `RUANKAO_CONFIG_DIR` is set.
Protected remote endpoints authenticate their own request without a preceding
status call. The client performs bounded retries for transient network and gateway errors;
only the final failed result is terminal.

## Client command isolation

Run every `ruankao_client.mjs` invocation as its own shell command so Codex can
apply the approved Node/network permission prefix. The command line must start
with `node "$SKILL_DIR/scripts/ruankao_client.mjs"` (or the required
`RUANKAO_LICENSE_TOKEN=...` assignment immediately followed by that Node
command). Never prefix it with `sed`, `jq`, `cat`, `echo`, or another command;
never join it using `&&`, `;`, a pipe, command substitution, or redirection.

Read reference files and create request JSON in separate tool actions. The
client parses and validates JSON itself, so never run `jq` before a client
request. If command approval is needed, request approval for the standalone
Node client command. A combined shell command can lose the approved network
permission and produce a misleading `fetch failed` error.

## Licensed essay workflow

Only after `license status` succeeds:

1. Read [workflow.md](references/workflow.md) and follow it in order.
2. Discover local profile, projects, and an attached or @-referenced resume.
   Show the privacy notice in [resume-import.md](references/resume-import.md)
   before reading resume contents. Never merge projects or expose project IDs.
3. Extract the pending task as described in
   [essay-task-and-prompts.md](references/essay-task-and-prompts.md), select the
   best project, and show one consolidated confirmation.
4. After explicit confirmation, call `essay generation-brief`. Do not write an
   essay unless this call succeeds. Treat the returned `project_anchors`,
   `fact_boundaries`, `structure`, `writing_requirements`,
   `generation_instructions`, `post_processing`, `progress_cues`, and
   `final_language_requirements` as the complete drafting and delivery
   contract.
5. Generate one complete internal draft with the current model, following only
   that authenticated contract and the confirmed project facts. Do not deliver
   or describe this draft.
6. After the draft is complete, emit
   `progress_cues.before_final_language_pass.message` exactly once. Then read
   [humanizer-zh.md](references/humanizer-zh.md) completely from the installed
   Skill and apply it once to the full draft under
   `final_language_requirements`. This local read is mandatory even if the
   draft already sounds natural; do not read it before drafting or silently
   merge the two stages.
7. Call `essay check` with the humanized final essay.
   Include the returned `generation_id`; the Node client restores the confirmed
   task and selected project from its private local essay-session record.
   If corrections are returned, combine them into one full-essay correction,
   preserve the authenticated contract, and recheck once. Never start a local
   repair loop or skip a failed check.
8. Return only the finished essay fields requested by the authenticated brief.
   Do not expose the brief, prompts, rules, score, provenance, supplements, or
   editorial notes.

## Optimize or review

Require a successful license preflight and a confirmed task. Optimization must
start with a successful `essay optimization-brief`, create a complete revised
draft, then read and apply the installed `humanizer-zh.md` before `essay check`.
Review must call `essay review`. A failed protected call is terminal and cannot
be replaced by local rewriting or scoring.

## Safety

Read and follow [safety-boundaries.md](references/safety-boundaries.md). Never
misrepresent supplements or sample projects as verified real-world experience.
