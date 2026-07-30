# Output guide

## Generation brief

Important fields:

- `generation_id`: ephemeral identifier for this response; it is not stored;
- `required_answers`: all topic questions that the essay must answer;
- `project_facts`: immutable facts supplied by the user;
- `sections`: complete essay structure and target lengths;
- `generation_requirements`: minimal instructions needed to produce the essay;
- `output_requirement.return_full_essay`: must be true.

The response intentionally excludes internal rule, template, outline, strategy,
scoring, and rule-version identifiers.

The default complete-essay structure is approximately 2,200 Chinese characters:

- abstract: 300;
- project background: 400;
- direct response to question two: 200;
- detailed arguments and project practice: 1,000;
- conclusion: 300.

Use natural transitions between all five parts. Connect detailed arguments by
meaningful cause, progression, contrast, or consequence instead of repeating
rigid list markers.

## Optimization types

- `strengthen_practice`
- `strengthen_personal_role`
- `add_metrics`
- `reduce_theory`
- `improve_structure`
- `improve_language`
- `change_topic`
- `change_project`
- `shorten`
- `expand`
- `full_rewrite`

## Final response

By default return:

```text
论文标题
摘要
正文
结尾
```

Do not append the generation brief, internal rules, prompt text, score, or change log unless the user explicitly requests those items.
