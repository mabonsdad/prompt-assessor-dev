# Maintainer guide

## Before changing or publishing anything

Use the AWS version in this repository, not the separate Lovable-connected project. Confirm that your AWS CLI is using the intended account and `eu-west-2` region. Keep the OpenAI key in server-side configuration only. Treat the public site and API as cost-bearing: there is no application-level login, rate limit or hard budget ceiling.

The tracked `samconfig.toml` contains region, origin, models and endpoint defaults, but **must not contain an API key**. `.env` and `.env.*` are ignored for future changes; do not force-add them. Before every push, inspect the staged file list and run a secret scan. A previously tracked `.env` held a legacy Supabase *publishable* key; removing it from the current Git tree does not remove older commits from GitHub. Review and rotate/revoke any historical value that was actually secret rather than assuming a new commit erases it.

## Configuration map

| Setting | Where it is used | Rule |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Browser build | Public API base URL only; no trailing `/api/chat`. A local dev build needs this if it should call the deployed API. |
| `VITE_BASE_PATH` | Vite build | `/experiments/prompt-assessor/` for the current public path; `/` for root-hosted local preview. |
| `OpenAIApiKey` / `OPENAI_API_KEY` | CloudFormation parameter / Lambda environment | Secret; supply through an approved private deployment channel, never Git, a browser variable, shell history or an example command. |
| `AllowedOrigin` / `ALLOWED_ORIGIN` | API Gateway and Lambda CORS | The frontend **origin**, currently `https://shwsh.co.uk`, without `/experiments/...`. Update both together through the stack. |
| `AnswerModel`, `CoachModel`, `WorkflowModel` | Lambda model selection | Defaults in `infra/template.yaml`; check model access, cost and output quality before changing. |

The default models are `gpt-6-luna` for trial answers and Prompt Coach, and `gpt-6.1-sol` at low reasoning effort for Workflow Coach. Trial answers and Prompt Coach do not browse. Workflow Coach's review may browse when opted in. Model names, pricing and availability can change; verify them in the [official model documentation](https://developers.openai.com/api/docs/models) before a migration.

## Local checks

```sh
npm ci
npm test
npm run build
npm run lint
sam validate --template infra/template.yaml
```

`npm run lint` currently fails on three inherited scaffold errors (`src/components/ui/command.tsx`, `src/components/ui/textarea.tsx` and `tailwind.config.ts`); the remaining Fast Refresh messages are warnings. `npm run dev` serves the React app. It does not run the Lambda locally or supply an OpenAI key. The Lambda tests stub outgoing model requests, so they do not require a real credential. For a browser integration check, configure the public `VITE_API_BASE_URL` locally and use only synthetic prompts; that check calls the live, paid API.

The dated [ten-case evaluation](coach-evaluation-2026-10-08.md) and [advice-only flow follow-up](advice-only-flow-evaluation-2026-10-08.md) explain expected coaching behaviour. To rerun the synthetic cases against the live API, use `node scripts/evaluate-coaches.mjs 1 10 /tmp/prompt-assessor-evaluation.json`. Do not put real inboxes, contracts or personnel records into tests. Evaluation output may contain model responses and should not be committed blindly.

## API deployment and key rotation

`infra/template.yaml` creates the HTTP API and Lambda. Deploy through your approved SAM/AWS process, supplying the `OpenAIApiKey` parameter privately. **Do not** put the key in `samconfig.toml`, a command line, a CI log or a checked-in environment file. Some guided deployment workflows save supplied parameters to configuration; inspect the result before staging. The repository does not include a secure key-delivery pipeline or a Secrets Manager integration.

If you change the Lambda environment manually, the CloudFormation stack may still hold its previous `OpenAIApiKey` parameter. A later full stack deployment can restore that older key unless the stack parameter is updated as part of the same controlled change. After rotation, verify the intended Lambda and API in AWS without printing the secret, and test one synthetic request from the allowed origin. A 401 from OpenAI usually means the Lambda's active key is invalid; changing a local `.env` does not update Lambda.

Changing CORS requires the API Gateway `AllowedOrigin` **and** the Lambda `ALLOWED_ORIGIN` to agree. Test a browser preflight and a `POST` from the actual origin. CORS success does not prove the key works, and a successful direct CLI request does not prove browser CORS works.

## Frontend publishing

Set the public build-time API base URL and base path, then run `npm run build`. Publish the generated `dist/` to the existing static host using its approved deployment process and invalidate the relevant CDN path. This repository does not declare the S3 bucket or CloudFront distribution, so do not guess a target or run a broad sync/delete command. Test on a phone-width browser as well as desktop: both modes, attachment warning, optional web search label, trial answer and critique.

## Operational limits to address before wider use

Add authentication or service-level throttling and a budget alert; consider moving the secret to a managed store. Review what happens when OpenAI times out, when a file or prompt contains sensitive data, and when the critique searches the public web. Do not interpret a proposed human stage gate as an actual enforced approval. Keep the app focused on coaching, not executing users' workplace jobs.
