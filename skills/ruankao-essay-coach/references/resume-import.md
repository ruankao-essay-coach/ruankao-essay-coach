# Resume import

Use this workflow when the user attaches or @-references a resume.

1. Read the resume in the current conversation context.
2. Extract a staged candidate profile containing only:
   - years of work experience;
   - primary industry;
   - current or typical role;
   - typical team size when stated;
   - programming languages;
   - technology stacks and platforms;
   - project types;
   - architecture strengths.
3. Extract each resume project as a separate staged project candidate. Preserve
   only facts actually stated for that project, such as name or type, period,
   industry, role, responsibilities, stack, modules, problems, measures, and
   results. Never merge details from different projects.
4. Do not infer exact team size, budget, dates, metrics, or responsibilities
   that the resume does not state.
5. Use the pending essay task to rank staged projects. Prefer a project whose
   period, stack, role, and activities best support the topic. If one candidate
   is clearly strongest, recommend it; otherwise include a short project-name
   choice in the consolidated confirmation.
6. Do not interrupt the user with a separate resume confirmation. Combine the
   staged profile, selected project, essay task, and any supplement plan into
   the workflow's single consolidated confirmation.
7. Save only the confirmed structured profile through `profile update`. This
   writes to the customer's local `~/.ruankao/profile.json`.
8. Create the confirmed selected project through `project create`. Leave
   unknown fields absent so `reasonable_supplement` can handle them later.
9. Do not send the raw resume to the Ruankao Server and do not store its full
   text in the local profile or project profiles. The Server receives only the
   structured fields needed for the current request and does not persist them.
10. Run `profile prepare` after saving. Candidate-profile gaps do not block
    essay generation when the selected project already contains the necessary
    role and technology anchors.
