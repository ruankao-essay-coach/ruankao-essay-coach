# Resume import

Use this workflow when the user attaches or @-references a resume.

1. Before reading any resume content, show this notice exactly once:

   > 隐私提示：您的简历仅用于资料提取和论文生成，不会被本产品用于模型训练。简历原文件不会上传到软考论文服务，服务端不会保存。

   This notice is informational. Continue without asking the user to confirm it.
2. Read the resume in the current conversation context.
3. Extract a staged candidate profile containing only:
   - years of work experience;
   - primary industry;
   - current or typical role;
   - typical team size when stated;
   - programming languages;
   - technology stacks and platforms;
   - project types;
   - architecture strengths.
4. Extract each resume project as a separate staged project candidate. Preserve
   only facts actually stated for that project, such as name or type, period,
   industry, role, responsibilities, stack, modules, problems, measures, and
   results. Never merge details from different projects.
5. Do not infer exact team size, budget, dates, metrics, or responsibilities
   that the resume does not state.
6. Use the pending essay task to rank staged projects. Prefer a project whose
   period, stack, role, and activities best support the topic. If one candidate
   is clearly strongest, recommend it; otherwise include a short project-name
   choice in the consolidated confirmation.
7. Do not interrupt the user with a separate resume confirmation. Combine the
   staged profile, selected project, essay task, and any supplement plan into
   the workflow's single consolidated confirmation.
8. Save only the confirmed structured profile through `profile update`. This
   writes to the customer's local `~/.ruankao/profile.json`.
9. Present all staged resume projects in the consolidated confirmation. Create
   every project the user confirms as a separate record through `project
   create`, not only the one selected for the current topic. This lets future
   topics rank authentic project alternatives instead of falling back to a
   bundled example. Leave unknown fields absent so `reasonable_supplement` can
   handle them later. Set `project_origin` to `resume` and keep the source
   document name only; never store the raw resume text.
10. Do not send the raw resume to the Ruankao Server and do not store its full
   text in the local profile or project profiles. The Server receives only the
   structured fields needed for the current request and does not persist them.
11. Do not run `profile prepare` automatically after resume import. It is not
    required when the selected project already supplies the necessary role and
    technology anchors. Use it only when the user explicitly requests a profile
    completeness audit.
12. Before selecting a sole local project, compare it with the candidate
    profile. A project with no meaningful overlap in industry, project type,
    role, period, or stack must not be auto-selected. The bundled example
    project is always a sample project, regardless of stale `fact_sources`.
