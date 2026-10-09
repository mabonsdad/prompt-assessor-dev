# Architecture and safety boundaries

This describes the application in this repository, not capabilities that a suggested prompt *might* have in a different, connected assistant.

## Request path

1. The React client sends a prompt, mode and options to `POST /api/chat` through API Gateway. Workflow Coach can also send a selected file as a base64 data URL.
2. Lambda calls the OpenAI Responses API for a brief **trial answer**. It has no web-search tool in this call. The answer is deliberately illustrative for multi-step work.
3. The client sends the original prompt and that trial answer to Lambda for a separate **critique**. An attachment, if supplied, is sent again. Prompt Coach reviews material gaps in a simple prompt; Workflow Coach may use public web search only when the user opted in.
4. The client displays the trial answer and review. Previous messages remain in browser memory for the current page session; this code does not write them to a database.

The frontend lives in `src/`; request shaping is in `src/hooks/useChat.ts`. The Lambda and coaching instructions live in `lambda/chat/index.js`. The HTTP API, CORS origin and server environment variables are declared in `infra/template.yaml`.

## What the modes can and cannot do

Prompt Coach is proportionate: a clear one-line question already implies a request for an answer and usually a short format. It focuses on consequential ambiguity, missing or stale evidence, unsupported claims in the trial answer, and task-specific guardrails. It does not require a role/persona for every prompt.

Workflow Coach considers four distinct questions: Is the mission clear? What evidence is missing? Which steps are better handled by an available, authorised connector, skill or deterministic tool? Where must a person decide or approve? It offers an **advice-only** ordered flow and a prompt for the central analysis/drafting step. It does not discover which workplace systems the trainee can access, run those connectors, perform calculations, or enforce any gate. A proposed human review is a recommendation, not an implemented permission check.

Both modes use model-generated feedback, so scores, source claims and proposed workflows can be wrong. Uploaded text is treated as untrusted data in the instruction, but that is not a hard security boundary against prompt injection. A suggested prompt must be reviewed before use in a real connected system.

## Data, privacy and cost

- The OpenAI API key is read from the Lambda's `OPENAI_API_KEY` environment variable; it must not be placed in the React build, `.env` files committed to Git, `samconfig.toml`, or documentation. The SAM template currently uses a `NoEcho` CloudFormation parameter, which masks display of the parameter but does **not** make a committed key safe. Prefer a managed secret store if this is hardened for broader use.
- The app sends prompt content to OpenAI twice, and sends an attachment twice when present. Files are not uploaded by this code to S3 or the OpenAI Files API. The Responses requests set `store: false`, but this is **not** a promise of zero retention or a substitute for reading [OpenAI's current API data controls](https://developers.openai.com/api/docs/guides/your-data). Avoid private training material unless its use is approved.
- When public web search is enabled, the critique may put details from the prompt or attachment into search queries. The UI warns at attachment selection; trainers should also warn participants *before* using web search.
- The browser checks file type and the 2 MB size limit; Lambda also validates extension, base64 and decoded size. This does not scan files for malware or sensitive data.
- Two model calls are made per submission. Web-enabled review may add cost. The code has no login, per-user quota, hard spending cap or application-level rate limiter. CORS limits which browser origins can read responses; **CORS is not authentication or abuse protection**. Apply service-level limits and monitor spending before using a public link with a large group.

For authoritative key-handling guidance, see the [OpenAI API authentication documentation](https://developers.openai.com/api/reference/overview). The distinction between response storage settings and other data handling is described in the [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data).

## Current deployment boundary

The SAM stack supplies a Node.js Lambda and HTTP API in `eu-west-2`. The static frontend is published separately at `/experiments/prompt-assessor/`; its S3 bucket, CloudFront distribution and publishing commands are not defined in this repository. `AllowedOrigin` must match the browser origin (`https://shwsh.co.uk`), **not** the page's path. The frontend's `VITE_API_BASE_URL` and `VITE_BASE_PATH` are build-time configuration, so changing them requires a new frontend build.
