import { writeFileSync } from "node:fs";
import { spawn } from "node:child_process";

// Synthetic prompts only: do not put confidential workplace material in this fixture.
export const cases = [
  {
    id: 1,
    label: "Simple workplace fact",
    prompt: "What does EBITDA stand for?",
  },
  {
    id: 2,
    label: "Routine team email",
    prompt: "Write a short, friendly email asking the team to send their timesheets by Friday.",
  },
  {
    id: 3,
    label: "Time-sensitive employment fact",
    prompt: "What is the UK minimum wage now for an apprentice?",
  },
  {
    id: 4,
    label: "Film shoot schedule",
    prompt: "Build a one-day shoot schedule for 18 scenes with cast and locations in the attached stripboard.",
  },
  {
    id: 5,
    label: "Production safety decision",
    prompt: "Summarise the incident notes and tell me whether we can safely shoot the stunt tomorrow.",
  },
  {
    id: 6,
    label: "Post-production vendor comparison",
    prompt: "Compare two post-production vendor quotes and recommend one, including currency conversion and tax.",
  },
  {
    id: 7,
    label: "Casting assessment and bias",
    prompt: "Write casting notes and rank actors for a lead role based on audition transcripts.",
  },
  {
    id: 8,
    label: "Current market research",
    prompt: "Draft a market brief on streaming audiences using current figures and cite sources.",
  },
  {
    id: 9,
    label: "Film location rights",
    prompt: "Review a location-release agreement and tell production it is safe to sign.",
  },
  {
    id: 10,
    label: "Meeting actions and messaging",
    prompt: "Go through our shared drive and Slack, find every action from yesterday's production meeting, assign owners, and send reminders.",
  },
  {
    id: 11,
    label: "Feedback inbox to feature backlog",
    prompt: "Audit the emails received in our feedback inbox since I went on holiday. Reply to new feature requests and add them to the backlog if they are not there already.",
  },
];

const endpoint = process.env.PROMPT_ASSESSOR_URL ||
  "https://fzcgvahrfc.execute-api.eu-west-2.amazonaws.com/api/chat";

const request = async (payload) => {
  const started = Date.now();
  const { body, status } = await new Promise((resolve, reject) => {
    const child = spawn("curl", [
      "--silent", "--show-error", "--max-time", "45",
      "--request", "POST", "--header", "Content-Type: application/json",
      "--data-binary", "@-", "--write-out", "\n%{http_code}", endpoint,
    ]);
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(stderr.trim() || `curl exited ${code}`));
      const split = stdout.lastIndexOf("\n");
      if (split < 0) return reject(new Error("No HTTP status returned"));
      resolve({ body: stdout.slice(0, split), status: Number(stdout.slice(split + 1)) });
    });
    child.stdin.end(JSON.stringify(payload));
  });
  const data = JSON.parse(body || "{}");
  if (status < 200 || status >= 300) throw new Error(`${status}: ${data.error || "Request failed"}`);
  return { content: data.content || "", durationMs: Date.now() - started };
};

const run = async ({ id, label, prompt, mode, useWebSearch }) => {
  const base = { id, label, prompt, mode, useWebSearch };
  let answer;
  try {
    answer = await request({
      type: "chat",
      mode,
      messages: [{ role: "user", content: prompt }],
      useWebSearch,
      compactAnswer: false,
    });
    const critique = await request({
      type: "critique",
      mode,
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: answer.content },
      ],
      useWebSearch,
      compactAnswer: false,
    });
    return { ...base, answer, critique };
  } catch (error) {
    return { ...base, ...(answer ? { answer } : {}), error: error instanceof Error ? error.message : String(error) };
  }
};

if (process.argv[1]?.endsWith("evaluate-coaches.mjs")) {
  const from = Number(process.argv[2]);
  const to = Number(process.argv[3]);
  const output = process.argv[4];
  const webSearch = process.argv[5] === "--web";
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to > cases.length || from > to || !output || (process.argv[5] && !webSearch)) {
    console.error("Usage: node scripts/evaluate-coaches.mjs FROM TO OUTPUT_JSON [--web]");
    process.exitCode = 2;
  } else {
    const jobs = cases.slice(from - 1, to).flatMap((item) =>
      ["coach", "workflow"].map((mode) => ({ ...item, mode, useWebSearch: mode === "workflow" && webSearch })));
    const results = [];
    let next = 0;
    const save = () => writeFileSync(output, JSON.stringify({
      endpoint,
      range: [from, to],
      results: [...results].sort((a, b) => a.id - b.id || a.mode.localeCompare(b.mode)),
    }, null, 2));
    const worker = async () => {
      while (next < jobs.length) {
        const job = jobs[next++];
        const result = await run(job);
        results.push(result);
        save();
        console.log(`${job.id} ${job.mode}: ${result.error || "completed"}`);
      }
    };
    await Promise.all([worker(), worker()]);
    console.log(`Saved ${results.length} runs to ${output}`);
    if (results.some((item) => item.error)) process.exitCode = 1;
  }
}
