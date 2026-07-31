# Output guide

## Generation brief

Important fields:

- `generation_id`: ephemeral identifier for this response; it is not stored;
- `topic`: confirmed essay title;
- `task_requirements`: confirmed questions the essay must answer;
- `project_anchors`: the selected project's factual spine—identity, role,
  functions, stack, problems, measures, and results—which must recur across
  the abstract, background, practice, and conclusion;
- `project_source`: states whether the essay uses authentic facts, constrained supplements, or a sample project;
- `practice_context`: selected mode and supplement strategy;
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

`essay check` returns three separate things. Do not collapse them.

- `passed` and `issues`: the rule gate. Up to three high-priority and three
  medium-priority objective findings, with matching `repair_requirements`. Use
  only those repair requirements in the next full rewrite. `gate` is
  `rules_only` as a reminder that this is not the whole gate.
- `semantic_review`: the rubric the current model must judge itself, including
  `project_grounding`, one item per confirmed task requirement, plus
  `topic_relevance`, `substance`, and `theory_ratio`. Each item carries
  `question`, `guidance`, and a
  `repair_template`. `evidence.must_be_verbatim` requires a quoted original
  sentence; `blocking_verdicts` lists the verdicts that mean unfinished.
- `length_adjustment`: `in_range`, the counted characters, the background
  paragraph range, and `instructions`. Handle this once at the end; it never
  consumes a repair round.

Client exit codes: `3` content issues remain, `4` content is fine but the length
is out of range, `0` the rule gate passed. Exit `0` still requires the semantic
gate before returning an essay.

## Review result

`essay review` returns no score. It returns `scoring_mode: model_judged`, the
seven `dimensions` with `max_score`, the `objective_findings` already mapped to
the dimension each finding actually affects, the `semantic_checks` that feed
each dimension, `unmapped_findings`, the same `semantic_review` and
`length_adjustment`, and `scoring_instructions`.

Assign each dimension score yourself after completing the semantic review. Keep
every deduction on the dimension it belongs to; never fill one dimension and
overflow into the next. Say when evidence is insufficient instead of producing a
precise-looking number.

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

Do not append the generation brief, internal rules, prompt text, score, change
log, practice-setting note, supplement list, or provenance explanation. Keep
fact provenance internal and return only the finished essay.
