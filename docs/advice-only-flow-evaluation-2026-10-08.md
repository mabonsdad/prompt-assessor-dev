# Advice-only workflow coaching follow-up — 8 October 2026

## Aim

Workflow Coach should help a trainee see the *shape* of a safe connected workflow without running it. The flow sits before the reusable prompt; the prompt normally covers the central AI analysis/drafting stage, not email sends or backlog writes. Connector and human-gate references are conditional advice.

## Feedback-inbox test

Synthetic prompt: “Audit the emails received in our feedback inbox since I went on holiday. Reply to new feature requests and add them to the backlog if they are not there already.” No email, backlog, documents, connector or confidential data was supplied.

Before the change, the substantive advice was mostly embedded in a long improved prompt. Prompt Coach noted the date and approval gaps; Workflow Coach identified sources and a gate, but the user had to reconstruct the sequence. A lengthy first version of the new format also hit the Lambda's 30-second timeout in this case. The final, shorter format completed in the live test.

The final Workflow Coach review makes the stages explicit:

1. Human confirms the audit window, meaning of “new”, scope and approval authority.
2. A future authorised workflow reads feature definitions, product guidance, reply templates and backlog conventions.
3. Proposed read-only inbox/backlog connectors retrieve in-scope records with source IDs, if available; supplied exports are an alternative.
4. **Prompt focus:** AI classifies requests, compares feature intent and drafts evidence-linked replies and backlog proposals; deterministic checks verify dates and IDs.
5. A human validates classifications, matches, wording and proposed entries.
6. Only a separately authorised actor or connected assistant sends/updates approved items, rechecks duplicates, and reports outcomes and failures.

The improved prompt is limited to stage 4. It has separate goal, sources, tools, process, guardrails, human-decision and output headings. Its guardrails prohibit unsupported roadmap promises, excess personal data, sends and record changes. Prompt Coach remains short and tells a user who puts this multi-system request in that mode that Workflow Coach is the better place to map the whole flow.

The final live checks also confirmed that a simple acronym question gets **no** manufactured flow, while a meeting-actions prompt suggests bounded drive/Slack retrieval, evidence-linked drafting, human approval, then only authorised updates and reminders. The review interface now labels the first response a *trial answer* and labels web search as a check performed in the review, not the trial response.

## Responsiveness and limits

The substantive Workflow Coach critique took about 27 seconds in one medium-effort run and 17–19 seconds in two low-effort runs; these are individual observations, not a latency guarantee. The short trial answer and concise review reduce the chance of trainees using this as an end-to-end work tool, but they do not impose a hard spend cap. No workplace connectors or external writes were added. Real files, actual connector permissions, downstream approvals and concurrent trainee load were not exercised. If a firm budget ceiling is needed, use service-level usage controls and rate limits in addition to prompt wording.

The low-effort setting follows [official OpenAI reasoning guidance](https://developers.openai.com/api/docs/guides/reasoning) for balancing reasoning cost and latency, while keeping GPT‑6.1 Sol for the more demanding critique. [OpenAI's workflow guidance](https://developers.openai.com/api/docs/guides/node-reference) likewise places human approval before sending and connector actions.
