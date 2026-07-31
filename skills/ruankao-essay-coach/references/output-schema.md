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
- `writing_requirements`: a short list containing project consistency and the two non-negotiable scoring techniques; use it as guidance for one natural essay, not as a checklist to expose.

The response intentionally excludes internal rule, template, outline, strategy,
scoring, and rule-version identifiers.

The default hard range is 2,200–2,650 non-whitespace characters. Section
targets scale dynamically from the 300, 400, 400, 1,000, and 300 base weights.
Treat them as the concise exam structure supplied by the Server; do not add
sentence-level instructions, scoring rules, keyword density, fixed
transitions, or internal rule metadata. Preserve a different range only when
the user's complete prompt explicitly requires it.

## Check result

`essay check` is deliberately narrow:

- `passed`, `issues`, and `repair_requirements` cover only objective project
  conflicts, exposed scoring-point labels, and exactly repeated sentences;
- `length_adjustment` reports only total non-whitespace character count and a
  concise trim-or-expand instruction;
- `gate` is `objective_only`; the endpoint does not use keyword matching to
  judge abstract quality, background quality, tradeoff meaning, or conclusion
  meaning.

Client exit codes: `3` means an objective issue remains, `4` means only the
length is out of range, and `0` means both passed. If correction is needed,
combine everything into one polish and recheck once.

## Review result

`essay review` returns no score. It returns `scoring_mode: model_judged`, seven
dimensions, objective findings, a compact semantic review for project/task
grounding, architecture tradeoffs, and the harmless-shortcoming conclusion,
plus length and scoring guidance.

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
