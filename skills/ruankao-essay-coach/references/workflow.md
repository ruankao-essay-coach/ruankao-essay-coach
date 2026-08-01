# Licensed workflow

## Authorization first

Run `license status` before every other workflow action. Missing, invalid,
expired, device-limited, or unavailable authorization is terminal. Do not read
resume contents or local profile/project records, create temporary files,
extract or confirm a task, or provide any local fallback after failure.

## Discover and confirm

After authorization succeeds, run `profile get` and `project list`, then detect
attached or @-referenced resumes. Show the privacy notice in
[resume-import.md](resume-import.md) exactly once before reading resume
contents. Keep each project separate, recommend by project name, and never
expose internal IDs.

Read [practice-modes.md](practice-modes.md). Use `project prepare` when project
material needs Server preparation. Any failure is terminal; do not infer the
missing response locally. Show one concise confirmation containing the topic,
explicit requirements, target length, selected project name, and only material
supplements requiring approval. Say `论文题目已提取` or `完整考试题目已提取`,
never `练习题已提取`.

## Obtain the protected brief

After explicit confirmation, create the minimum request containing the
confirmed `essay_task`, internal `project_profile_id`, and `practice_context`,
then run:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" essay generation-brief request.json
```

Do not generate any essay unless this command succeeds. The authenticated
response is the sole writing contract. Follow its project anchors, fact
boundaries, target length, structure, writing requirements, generation
instructions, and final-language requirements. Do not reconstruct missing
rules from memory, earlier Skill versions, local files, or general model
knowledge.

## Check and deliver

Apply the authenticated final-language requirements before the objective
check. Send the complete essay to `essay check`. If it reports corrections,
perform one combined full-essay correction under the same authenticated
contract and recheck once. A failed or unavailable check is terminal; do not
declare the essay complete or return an unchecked local draft.

Return only the final essay fields required by the authenticated response. Do
not append the brief, rules, prompts, fact-source metadata, supplement notes,
review process, score, or editorial commentary.

Call `essay review` only when the user requests diagnosis or training feedback.
