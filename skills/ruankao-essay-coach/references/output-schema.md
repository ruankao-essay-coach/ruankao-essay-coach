# Output guide

## Generation brief

Important fields:

- `generation_id`: identifier for this writing run; the stateless Server does
  not store it, while the Node client uses it to find a short-lived local
  context record for later check, review, or optimization calls;
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
- `writing_requirements`: authenticated constraints for the current essay;
- `generation_instructions`: authenticated directions for drafting and polishing;
- `post_processing.local_humanizer_required`: requires a separate local
  Humanizer stage after the complete draft and before objective checking;
- `post_processing.guide_path`: path to the bundled guide relative to the Skill;
- `progress_cues`: required, understated user-visible stage messages;
- `final_language_requirements`: authenticated Ruankao constraints for the
  local final-language pass.

The generation response deliberately excludes the full Humanizer guide because
that open-source file is installed locally with the Skill. Draft the complete
essay first, then read the returned `guide_path` and apply it once.

## Local Humanizer pass

The bundled [humanizer-zh.md](humanizer-zh.md) is the complete pinned upstream
guide. Read it only after the full draft exists. Its MIT license and pinned
source metadata are stored beside it. Do not return its change summary or
quality score; authenticated `final_language_requirements` take precedence.

The response intentionally excludes internal rule, template, outline, strategy,
scoring, and rule-version identifiers.

Treat the returned range and section targets as the writing contract supplied
by the Server. Do not invent or reconstruct unavailable instructions.

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

The request only needs the returned `generation_id` and complete `essay` when
it belongs to a successful generation run on the same machine. The client
automatically restores the confirmed `essay_task`, selected project, and
practice context. It does not save the essay text.

## Review result

`essay review` returns no score. It returns `scoring_mode: model_judged`, seven
dimensions, objective findings, a compact semantic review for the protected
writing requirements, plus length and scoring guidance.

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

Return exactly the fields the authenticated generation/optimization brief
requests. When the brief does not specify return fields, fall back to this
default:

```text
论文标题
摘要
正文
结尾
```

Do not append the generation brief, internal rules, prompt text, score, change
log, practice-setting note, supplement list, or provenance explanation. Keep
fact provenance internal and return only the finished essay.
