# Practice modes and fact provenance

## Default behavior

Use `reasonable_supplement` with `confirm_key_settings` by default. Preserve all
known facts, fill only the gap needed by the confirmed essay task, and keep the
setting proportional to the project's period, scale, stack, and user role.

Do not ask the user to invent every missing detail. Ask only when a new setting
would materially change the project, such as introducing Kubernetes, adding a
service mesh, changing a monolith into microservices, or claiming a large
rollout. Present a concise proposal and continue after confirmation.

## Modes

- `authentic`: Use only facts explicitly supplied or edited by the user. Ask for
  missing material and never add model-supplemented facts.
- `reasonable_supplement`: Use confirmed facts as immutable anchors. Add
  plausible business context, implementation details, phase activities,
  responsibilities, problems, measures, modest results, and the minimum
  background facts needed to explain why a new project was launched or why a
  legacy system required refactoring.
- `sample_project`: Build a coherent practice project and clearly identify it as
  a simulated setting outside the essay. Do not claim it is the user's real
  employment history.

Supported supplement strategies:

- `confirm_key_settings`: confirm material additions before generation;
- `auto`: add plausible settings directly and keep their provenance internal.

## Boundaries for reasonable supplements

Match the known project period, team size, architecture, technology generation,
and user role. Prefer a limited pilot and gradual rollout over an unsupported
claim of full deployment. Do not enlarge a small system into a province-wide or
multi-cluster platform without a confirmed basis.

Never supplement customer or organization names, contract numbers or amounts,
awards, certificates, acceptance documents, or other externally verifiable
facts. Never overwrite confirmed project name, period, budget, team size, role,
responsibilities, or architecture.

For a service-mesh topic over an existing Spring Cloud and Kubernetes project,
prefer a proposal such as two non-core domains piloting Istio for traffic
governance, canary release, resilience, and observability. Keep the user's role
to selection, pilot design, and rollout review unless broader responsibility is
already confirmed.

## Fact provenance

Keep original values in the project content. Record field provenance in
`fact_sources` and additions in `practice_supplements`:

```json
{
  "fact_sources": {
    "project_name": {"source": "user_confirmed", "confirmed": true},
    "team_size": {"source": "user_edited", "confirmed": true}
  },
  "practice_supplements": [
    {
      "field": "service_mesh_pilot",
      "value": "在两个非核心业务域试点 Istio",
      "source": "model_supplemented",
      "confidence": "plausible",
      "confirmed": true
    }
  ]
}
```

Allowed sources are `user_confirmed`, `user_edited`, `model_supplemented`, and
`sample_project`. Reuse confirmed supplements for consistency, but continue to
label their source internally; never append provenance or a supplement note to
the finished essay.
