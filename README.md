# Prompt Assessor

[Try the live app](https://shwsh.co.uk/experiments/prompt-assessor/) · [Run a 30-minute training session](docs/training-session.md) · [Architecture and safety](docs/architecture-and-safety.md) · [Maintainer guide](docs/maintainer-guide.md)

Prompt Assessor is a mobile-friendly training exercise for writing better AI requests. A trainee enters **one prompt** and sees a short, illustrative trial answer followed by coaching on what would make that prompt more reliable. It is deliberately **not** a way to complete a workplace task: it has no private connectors, cannot send messages or update records, and does not enforce the approval stages it recommends.

| Mode | Best for | Review output |
| --- | --- | --- |
| **Prompt Coach** | A short question or single-purpose drafting request | A proportionate score, material gaps, and a concise rewrite when one is needed. A clear factual question is not penalised for lacking a persona or elaborate format. |
| **Workflow Coach** | Research, document work, or a multi-step request | Separate mission ambiguity from missing evidence; suggest an **advice-only** sequence of sources, potential tools/connectors, checks and human gates; then write a reusable prompt for the central AI step. |

Workflow Coach accepts an optional PDF, DOCX, TXT, Markdown or CSV file up to 2 MB. The paperclip presents a privacy warning before the file chooser opens. Its optional **Check public sources in review** setting allows web search in the *critique only*; the trial answer never searches. Unknown details in the suggested prompt are marked `[like this]` rather than invented. The mobile trial answer is shorter, but the review requirements are the same.

The trial answer and review are model outputs, not verified facts or professional clearance. An attachment is passed to both calls. Use synthetic or authorised, de-identified material in training; do not upload confidential or personal data without organisational approval. See [data flow and limitations](docs/architecture-and-safety.md).

## What is in this repository

- `src/`: Vite/React/TypeScript frontend, including the two-mode interface.
- `lambda/chat/`: Node.js AWS Lambda that calls the OpenAI Responses API.
- `infra/template.yaml` and `samconfig.toml`: AWS SAM API configuration and **non-secret** deployment defaults.
- `scripts/evaluate-coaches.mjs`: synthetic live-API regression exercise; it incurs model usage.
- `docs/`: session plan, operational guidance and [dated evaluation notes](docs/coach-evaluation-2026-10-08.md).

The frontend is hosted separately as static files; the repository does **not** contain a full S3/CloudFront hosting template or automated deployment pipeline. The older Lovable-connected project is separate from this AWS version.

## Develop and check locally

Use a supported Node.js version and npm:

```sh
npm ci
npm run dev
```

For a local browser to call the deployed API, set `VITE_API_BASE_URL` to its public base URL in an ignored local environment file or your shell. `VITE_BASE_PATH` controls the static site subpath at build time (the live site uses `/experiments/prompt-assessor/`). Values beginning `VITE_` are bundled into browser code: **never put an API key there**. The OpenAI key belongs only in the Lambda's server-side configuration. [OpenAI's API guidance](https://developers.openai.com/api/reference/overview) likewise says not to expose keys in client-side code.

```sh
npm test
npm run build
npm run lint
```

`npm run lint` currently reports three pre-existing scaffold errors in `src/components/ui/command.tsx`, `src/components/ui/textarea.tsx` and `tailwind.config.ts`; tests and build are the passing checks for this version. The live evaluation script makes paid calls; run it only when needed and use synthetic prompts. Setup, key rotation, deployment checks and known limitations are in the [maintainer guide](docs/maintainer-guide.md).
