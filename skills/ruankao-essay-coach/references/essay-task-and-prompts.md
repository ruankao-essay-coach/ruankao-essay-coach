# Essay task extraction

Use this file only after the mandatory `license status` call succeeds.

Extract the user's original words into a pending task:

```json
{
  "source_text": "用户输入的完整原文",
  "topic": "论文标题",
  "task_requirements": [{"id": "req_1", "content": "论述要求"}],
  "structure_requirements": [],
  "other_constraints": [],
  "source_type": "exam_prompt",
  "confidence": "high",
  "status": "pending_confirmation",
  "target_words": {"min": 2200, "max": 2650}
}
```

Preserve the user's explicit requirements and limits. Keep the task pending
until one consolidated project-and-task confirmation. Only explicit user
confirmation changes `status` to `confirmed`.

Use `论文题目` for user-facing wording. When the input contains a title,
background passage, and numbered requirements, call it `完整考试题目`. Never
call it `练习题`. For title-only input, say that requirements were inferred and
that the complete original prompt takes priority.

This public Skill does not contain a generation or polish prompt. Obtain all
writing instructions from a successful authenticated `essay generation-brief`
or `essay optimization-brief`. If that call fails, stop without generating,
rewriting, scoring, or constructing a substitute prompt.
