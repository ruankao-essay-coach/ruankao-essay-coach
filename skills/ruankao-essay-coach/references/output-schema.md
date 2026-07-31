# Output guide

## Generation brief

Important fields:

- `generation_id`: ephemeral identifier for this response; it is not stored;
- `topic`: confirmed essay title;
- `task_requirements`: confirmed questions the essay must answer;
- `project_source`: states that the selected confirmed project is used;
- `total_words`: hard minimum and maximum;
- `structure`: five concise section targets and focus lists;
- `writing_requirements`: a short list of first-generation constraints.

The response intentionally excludes internal rule, template, outline, strategy,
scoring, and rule-version identifiers.

The default hard range is 2,100–2,200 non-whitespace characters. The default
section targets are 300, 400, 200, 1,000, and 300. Treat them as the concise
exam structure supplied by the Server; do not add sentence-level instructions,
scoring rules, keyword density, fixed transitions, or internal rule metadata.

## Check result

`essay check` returns `passed`, up to three high-priority issues, up to three
medium-priority issues, and matching `repair_requirements`. Use only those
repair requirements in the second-round full rewrite.

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
