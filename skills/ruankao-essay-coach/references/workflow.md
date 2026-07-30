# Full workflow

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

Require a reusable project profile containing:

- project name, industry, start and end date;
- budget and team size;
- user role and concrete responsibilities;
- project goal and main modules;
- architecture and quality attributes;
- at least two authentic problems;
- measures corresponding to those problems;
- at least one quantified result.
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

Run preparation:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" project prepare proj_xxx
```

Ask each returned question before continuing when `ready` is false.

## Generation brief

Create a JSON request:

```json
{
  "subject": "system_architect",
  "topic": "论软件系统架构评估",
  "project_profile_id": "proj_xxx",
  "target_words": 2200
}
```

Run:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" essay generation-brief request.json
```

Generate the complete essay according to:

- `required_answers`;
- `project_facts`;
- every section's `target_words` and `must_include`;
- `generation_requirements`.

Do not expose the raw generation brief in the final answer.

## Consistency repair

Write the generated essay into a JSON request:

```json
{
  "topic": "论软件系统架构评估",
  "project_profile_id": "proj_xxx",
  "essay": "完整论文正文"
}
```

Run:

```bash
node "$SKILL_DIR/scripts/ruankao_client.mjs" essay check check.json
```

Apply all high-severity repairs. Preserve the topic, project facts, complete structure, and target length while repairing.

## Completion

Return the repaired complete essay. The Server does not store generation
history or the full essay.
