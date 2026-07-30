---
name: ruankao-essay-coach
description: Generate, rewrite, optimize, and review complete Chinese practice essays for the Ruankao system architect examination using an enduring candidate profile and authentic project experience. Use when the user wants to import an attached or @-referenced resume, build or update a candidate profile, generate a full practice essay, organize project materials, adapt an essay to a topic, improve an essay, check consistency, or request a training score. Do not use for a live examination, fabricated personal experience, impersonation, or guaranteed-pass claims.
---

# Ruankao Essay Coach

Use the bundled Node.js API client to keep confirmed candidate and project facts on the customer's machine, obtain private generation briefs from the stateless Server, then use the current model to write the complete essay.

## Configure

The bundled client defaults to the hosted API. Require the License Token:

```bash
export RUANKAO_LICENSE_TOKEN="your-license-key"
```

Set `RUANKAO_API_BASE_URL` only when overriding the default
`https://api.bindvault.me/ruankao/api/v1`.

Run `node scripts/ruankao_client.mjs license status` before the first protected request.

## Generate a complete essay

1. Confirm the request is for practice, not a live examination.
2. Run `profile get`. This reads `~/.ruankao/profile.json`. Reuse an existing confirmed candidate profile without asking the same background questions again.
3. If no complete profile exists, first look for an attached or @-referenced resume. Read it in the current model context, extract only the allowed structured profile fields, summarize them for confirmation, then save them locally with `profile update`. Never upload or persist the raw resume.
4. Ask at most three conversational follow-up questions from `profile prepare`. Allow the user to answer approximately, skip, or correct extracted information.
5. Obtain the essay topic and select one authentic project profile. Never merge facts from different projects.
6. Create or select the locally stored project profile through the client, then run `project prepare`.
7. Ask at most three missing project questions per turn. Do not invent dates, scale, role, problems, measures, results, customer feedback, or shortcomings.
8. Run `topic analyze`, then `essay generation-brief`.
9. Generate the complete Chinese essay from the returned brief.
10. Unless the user specifies another length, follow the returned 2,200-character structure: abstract 300, background 400, response to question two 200, detailed arguments 1,000, and conclusion 300.
11. Connect the sections and arguments with natural cause, progression, contrast, or summary transitions. Do not present them as mechanically joined independent answers.
12. Include the title, abstract, complete body, and conclusion. Cover every `required_answers` item and preserve every `project_facts` value.
13. Run `essay check` on the generated text.
14. Apply the returned `repair_instructions`, then recheck when high-severity issues existed.
15. Return only the final complete essay unless the user asks for analysis or scoring.

Read [workflow.md](references/workflow.md) when executing the full generation or rewrite workflow.
Read [resume-import.md](references/resume-import.md) when the user attaches or @-references a resume.

## Optimize an existing essay

Call `essay optimization-brief` with the project, topic, complete essay, optimization type, and target length. Rewrite the complete essay using the returned strategy. Never silently change confirmed project facts.

Supported optimization types are documented in [output-schema.md](references/output-schema.md).

## Check or review

- Use `essay check` for factual conflicts, missing topic coverage, and theory ratio.
- Use `essay review` only when the user explicitly requests a score or diagnosis.
- Describe scores as training feedback, never as an official result.

## Safety

Read and follow [safety-boundaries.md](references/safety-boundaries.md). Refuse live-exam answer generation and fabricated real-world project experience.

## Client

Use `node scripts/ruankao_client.mjs --help` for commands. The client requires Node.js 18+ and stores the profile in `~/.ruankao/profile.json`, projects in `~/.ruankao/projects`, and the stable device ID in `~/.ruankao/device_id`. `RUANKAO_CONFIG_DIR` may override this directory. Local CRUD commands do not require the Server or License; protected analysis commands read the License Token from the environment and send only the structured data needed for that request.
