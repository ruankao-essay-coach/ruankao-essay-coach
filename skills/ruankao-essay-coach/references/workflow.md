# Licensed workflow

## Authorization first

Run `license status` before every other workflow action. Missing, invalid,
expired, device-limited, or unavailable authorization is terminal. Do not read
resume contents or local profile/project records, create temporary files,
extract or confirm a task, or provide any local fallback after failure.

Call `license status` only once in the current conversation. Its short-lived
local session marker covers later local profile/project commands. Protected
remote commands send their token directly to the target endpoint and must not
be preceded by another status call. Refresh only after expiry, changed
credentials/device/Server, or an authorization rejection.

Run each Node client invocation standalone. Never combine it with `sed`, `jq`,
`cat`, JSON creation, or another client invocation through `&&`, `;`, pipes,
substitutions, or redirection. The client validates request JSON internally;
read files and write JSON in separate tool actions. This isolation is required
for the approved Node command to retain network permission.

The client automatically retries transient network failures and 502/503/504
responses. Do not add shell retry loops. A final client failure remains
terminal for the current workflow.

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

After a successful response, the Node client stores the confirmed task,
selected project reference, practice context, and returned `generation_id` in
the private local data directory. It never stores the generated essay. The
Server remains stateless.

## Check and deliver

Immediately before the final-language pass, send exactly one brief progress
update to the user: `正在最终上下文一致性梳理。` Do not mention AI detection,
de-AI processing, humanization, Humanizer, or the individual language rules.
Do not post a second language-processing status update.

Apply the complete authenticated `final_language_guide` once to the full
essay. Treat `final_language_requirements` as the Ruankao-specific constraints
that override any conflicting generic guidance. Do this before the objective
check. Send the complete essay to `essay check`. Include the returned
`generation_id`; do not manually repeat `essay_task` or project data. The Node
client restores that context from the matching local essay session. If it reports corrections,
perform one combined full-essay correction under the same authenticated
contract and recheck once. A failed or unavailable check is terminal; do not
declare the essay complete or return an unchecked local draft.

Return only the final essay fields required by the authenticated response. Do
not append the brief, rules, prompts, fact-source metadata, supplement notes,
review process, score, or editorial commentary.

Call `essay review` only when the user requests diagnosis or training feedback.
