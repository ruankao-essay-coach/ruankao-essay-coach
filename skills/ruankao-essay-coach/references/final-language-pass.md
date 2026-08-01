# Final language pass

Apply these bundled rules once after the objective essay check and immediately
before delivery. This is an editorial pass, not another essay generation
round. It has no dependency on another installed skill.

## Natural-writing rules

- Remove mechanical transitions such as repeated `首先、其次、再次` and
  numbered prose such as `第一、第二、第三`. Let the preceding technical fact
  lead naturally into the next decision, measure, or result.
- Vary sentence length and openings. Merge short sentences that repeat the
  same subject, and split overloaded sentences when causality becomes hard to
  follow. Do not force every paragraph into the same rhythm.
- Replace filler and inflated claims with project facts. Watch for repeated
  `此外、值得注意的是、至关重要、充分体现、显著彰显、奠定坚实基础`.
- Avoid formulaic negation such as repeated `不仅……而且……` or
  `不是……而是……`; state the architectural judgment directly unless the
  contrast carries real technical meaning.
- Break forced three-part lists and synonym cycling. Keep a three-item list
  only when the project genuinely has three parallel items; use the same
  technical noun consistently instead of inventing synonyms.
- Remove vague authority and praise such as `业内专家认为` or `获得高度认可`
  unless the confirmed project facts identify the source. Keep supported
  customer feedback concrete.
- Remove slogan-like paragraph endings and generic optimistic conclusions.
  End paragraphs on a decision, mechanism, observed result, limitation, or
  next action.
- Avoid excessive em dashes, bold labels, inline headings, bullet lists,
  emojis, chat residue, editor commentary, and knowledge-cutoff disclaimers in
  the essay.
- Prefer direct verbs and simple sentence structures. Keep established
  architecture terms and necessary exam terminology even when they resemble
  frequently used AI vocabulary.
- Retain a formal first-person examination tone. Do not introduce casual chat,
  humor, emotional asides, deliberate disorder, unsupported opinions, or a
  separate editor's voice merely to make the text feel human.

## Ruankao invariants

The following invariants override every stylistic rule above:

1. Preserve the title, task response, anonymized project identity, confirmed
   dates, duration, scale, role, technology names, measurements, results, and
   causal relationships.
2. Preserve the five-part 300–330 / 400 / 400 / 1,000–1,200 / 300–400
   framework and keep the complete essay within the confirmed target length.
3. Preserve one or two naturally narrated architecture tradeoffs, including
   why the chosen design fit, why another design was not used, and what cost
   was accepted. Never add labels such as `架构权衡一/二` or `方案A/B/C`.
4. Preserve the conclusion's launch and operating results, customer feedback,
   personal learning, harmless shortcoming, next improvement, and natural
   closing sentence.
5. Return only the revised essay. Do not append a change summary, checklist,
   explanation, or quality score.

After the pass, silently verify these invariants. If a stylistic change breaks
one, restore the affected fact or sentence without starting another rewrite
round.

These rules are adapted for Ruankao essays from
[op7418/humanizer-zh](https://github.com/op7418/humanizer-zh). See
[humanizer-zh-license.txt](humanizer-zh-license.txt) for attribution and its
MIT license.
