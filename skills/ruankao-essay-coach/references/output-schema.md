# Output guide

## Generation brief

Important fields:

- `generation_id`: ephemeral identifier for this response; it is not stored;
- `topic`: confirmed essay title;
- `task_requirements`: confirmed questions the essay must answer;
- `project_source`: states whether the essay uses authentic facts, constrained supplements, or a sample project;
- `practice_context`: selected mode, supplement strategy, and disclosure flag;
- `practice_supplements`: source-labeled settings allowed for this essay;
- `fact_boundaries`: constraints that prevent supplements from conflicting with known facts;
- `total_words`: hard minimum and maximum;
- `structure`: five concise section targets and focus lists;
- `writing_requirements`: a short list of mandatory first-generation constraints; satisfy every item.

The response intentionally excludes internal rule, template, outline, strategy,
scoring, and rule-version identifiers.

The default hard range is 2,100–2,200 non-whitespace characters. The default
section targets are 300, 400, 200, 1,000, and 300. Treat them as the concise
exam structure supplied by the Server; do not add sentence-level instructions,
scoring rules, keyword density, fixed transitions, or internal rule metadata.

## Check result

`essay check` returns `passed`, up to three high-priority issues, up to three
medium-priority issues, and matching `repair_requirements`. Use only those
repair requirements in the next full rewrite. The bundled client exits with
code `3` when `passed` is false. Do not return a final essay until a later check
returns `passed: true`.

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

When `disclosure_required` is false, do not append the generation brief,
internal rules, prompt text, score, or change log. When it is true, append only
a concise note after the essay:

```text
练习设定说明：本文为覆盖题目而补充了……；这些内容属于备考练习设定，不代表经核实的真实履历。
```

Do not include this note in the 2,100–2,200 character count.
