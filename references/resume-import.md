# Resume import

Use this workflow when the user attaches or @-references a resume.

1. Read the resume in the current conversation context.
2. Extract only:
   - years of work experience;
   - primary industry;
   - current or typical role;
   - typical team size when stated;
   - programming languages;
   - technology stacks and platforms;
   - project types;
   - architecture strengths.
3. Do not infer exact team size, budget, dates, metrics, or responsibilities
   that the resume does not state.
4. Present a short structured summary and ask the user to confirm or correct it.
5. Save only the confirmed structured profile through `profile update`. This
   writes to the customer's local `~/.ruankao/profile.json`.
6. Do not send the raw resume to the Ruankao Server and do not store its full
   text in the local profile or project profiles. The Server receives only the
   structured fields needed for the current request and does not persist them.
7. Run `profile prepare` and ask at most three remaining questions.

Resume project descriptions may help the user choose a project, but create a
separate project profile before generating an essay. Do not combine details
from multiple resume projects.
