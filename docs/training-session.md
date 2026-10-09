# A 30-minute Prompt Assessor session

Use the [live app](https://shwsh.co.uk/experiments/prompt-assessor/) with **synthetic, public or explicitly authorised material only**. The app shows a brief trial answer and then critiques the trainee's prompt; it does not validate every fact or run workplace workflows. Ask trainees to judge both outputs, not merely to accept the score.

## Run of show

Allow two minutes for the boundary and privacy warning, five tasks of about five minutes each, and three minutes to compare lessons. Work in pairs if devices or API budget are limited. Have one pair share a revised prompt after each task rather than asking everyone to submit repeatedly. The prompts below are starting points; avoid copying current numeric answers into the exercise because the point is to check them.

| Time | Task and mode | What to notice / improve |
| --- | --- | --- |
| 0–2 min | Introduce both modes. Do not upload real company documents or personal information. | Coaching advice is not an executed connector, an approval or a factual guarantee. |
| 2–7 min | **1. Proportionate prompting — Prompt Coach.** Ask: “What does EBITDA stand for?” Then try an unclear variant: “Can we use EBITDA for this?” | The first question needs little scaffolding; the second needs the missing decision context. A role/persona is not automatically useful. |
| 7–12 min | **2. Freshness and hallucination — Prompt Coach.** Ask: “What is the UK apprentice minimum wage now?” Compare the trial answer with the dated [GOV.UK rates page](https://www.gov.uk/national-minimum-wage-rates). | Distinguish a clear user question from a model's lack of live evidence. Improve the prompt to require a current authoritative source, date and eligibility conditions; do not reward a confident but stale figure. |
| 12–17 min | **3. Source and denominator — Workflow Coach.** Ask: “Write a short brief on UK streaming audiences and tell us which service is winning.” Use the public [Ofcom Media Nations report](https://www.ofcom.org.uk/media-use-and-attitudes/media-habits-adults/media-nations-2026) or [BFI statistical yearbook](https://www.bfi.org.uk/industry-data-insights/statistical-yearbook) as a reference. | Specify geography, period, audience measure and decision purpose. Spot conflicting definitions, missing evidence and unsupported certainty. If web review is enabled, check its citations; the trial answer itself did not search. |
| 17–22 min | **4. Bias and human judgement — Workflow Coach.** Use a fictional casting brief: “Rank these three performers for a lead role from their audition notes.” Write three short synthetic notes, not real applicants' records. | Ask for a role-related rubric, evidence-linked observations, uncertainty and a bias check. A human casting decision is the gate; a score from the model is not a hiring decision. |
| 22–27 min | **5. Connected workflow, advice only — Workflow Coach.** Ask: “Review feedback-inbox emails since my holiday, reply to new feature requests and add missing ones to the backlog.” Supply **no** real email. | Separate the ambiguous date/definition from missing product sources. Look for an ordered proposal: clarify → read approved definitions/backlog → proposed read-only email/backlog connectors → classify and draft → human review → only separately authorised sends/writes → report. The app should recommend this flow, not do it. |
| 27–30 min | Debrief. | Which omissions were in the *prompt*, which were model/capability errors, and which actions need evidence, deterministic checking or a human? |

## Facilitator prompts

After each run, ask: “What did the answer assume?”, “Which source would change your confidence?”, “What can a tool calculate or retrieve more reliably than prose?”, and “Who has authority to decide or act?” Invite a trainee to turn one critique into a shorter, clearer prompt with `[placeholders]` for genuinely missing facts. A good rewrite should ask a focused question when a missing answer blocks the task, and state a concrete guardrail only where the risk warrants it.

Keep the distinction between *advice* and *execution* visible. Workflow Coach may recommend a connector or a local deterministic check, but this app has neither the connection nor permission to perform the action. A trial answer may still be wrong. If the group finds an error, treat it as the learning moment: identify whether better context, a checked source, a tool, or human review would have caught it.

For a film/TV-specific variant of task 5, replace the inbox with a fictional shoot schedule or location-release request and discuss the production manager's or qualified safety/legal reviewer’s gate. Do not use the app to clear a real stunt or sign a real contract. The [HSE film and TV guidance](https://www.hse.gov.uk/entertainment/theatre-tv/index.htm) is a public starting point for discussing why the evidence and qualified human decision matter, not a substitute for that decision.
