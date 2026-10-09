import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(directory, "index.js"), "utf8");

function loadHandler() {
  const lambdaModule = { exports: {} };
  new Function("exports", "module", "require", source)(lambdaModule.exports, lambdaModule, () => undefined);
  return lambdaModule.exports.handler;
}

describe("chat Lambda", () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalBaseUrl = process.env.OPENAI_BASE_URL;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_BASE_URL = "https://example.test/v1";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env.OPENAI_API_KEY = originalApiKey;
    process.env.OPENAI_BASE_URL = originalBaseUrl;
    vi.restoreAllMocks();
  });

  it("uses the low-cost answer model for a Prompt Coach answer", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output_text: "An API lets software communicate." }),
    });
    globalThis.fetch = fetchMock;

    const response = await loadHandler()({
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify({
        type: "chat",
        mode: "coach",
        messages: [{ role: "user", content: "Define an API." }],
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ content: "An API lets software communicate." });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.test/v1/responses",
      expect.objectContaining({ method: "POST" })
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      model: "gpt-6-luna",
      store: false,
    });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).instructions).toContain("do not volunteer a remembered historic number");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).instructions).toContain("Do not invite the user to connect a workplace account here");
  });

  it("requests a shorter mobile trial answer without imposing a cutoff", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output_text: "A concise answer." }),
    });
    globalThis.fetch = fetchMock;
    const handler = loadHandler();
    const event = {
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify({
        type: "chat",
        mode: "workflow",
        compactAnswer: true,
        messages: [{ role: "user", content: "Explain the policy." }],
      }),
    };

    expect((await handler(event)).statusCode).toBe(200);
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request.instructions).toContain("read on a phone");
    expect(request.instructions).toContain("brief illustrative trial response for prompt coaching");
    expect(request.instructions).toContain("not completing the user's workplace project");
    expect(request.instructions).toContain("small synthetic or authorised, de-identified excerpt");
    expect(request.max_output_tokens).toBe(2800);
  });

  it("reviews a single prompt with its attachment and only searches when requested", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output_text: "# Workflow review\nA focused review." }),
    });
    globalThis.fetch = fetchMock;

    const response = await loadHandler()({
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify({
        type: "critique",
        mode: "workflow",
        attachment: { name: "policy.txt", data: `data:text/plain;base64,${Buffer.from("A supplied policy excerpt.").toString("base64")}` },
        useWebSearch: true,
        messages: [
          { role: "user", content: "Prepare a recommendation." },
          { role: "assistant", content: "Here is a draft recommendation." },
        ],
      }),
    });

    expect(response.statusCode).toBe(200);
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request).toMatchObject({
      model: "gpt-6.1-sol",
      tools: [{ type: "web_search", search_context_size: "low" }],
      reasoning: { effort: "low" },
    });
    expect(request.input[0].content[0].text).toContain("User prompt:\nPrepare a recommendation.");
    expect(request.input[0].content[1]).toMatchObject({ type: "input_file", filename: "policy.txt" });
    expect(request.instructions).toContain("Use square brackets");
    expect(request.instructions).toContain("Ignore its length or cutoff");
    expect(request.instructions).toContain("**Guardrails**");
    expect(request.instructions).toContain("## Suggested flow (advice only)");
    expect(request.instructions).toContain("**Prompt focus**");
    expect(request.instructions).toContain("not an automation runner");
    expect(request.instructions).toContain("pause for human review");
    expect(request.instructions).toContain("Public web search is enabled for this critique only");
    expect(request.max_output_tokens).toBeGreaterThan(900);
  });

  it("lets Prompt Coach inspect the trial answer without treating it as verified evidence", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output_text: "# 7/10\nCheck a current source." }),
    });
    globalThis.fetch = fetchMock;

    const response = await loadHandler()({
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify({
        type: "critique",
        mode: "coach",
        messages: [
          { role: "user", content: "What is the rate now?" },
          { role: "assistant", content: "The rate is £7.55." },
        ],
      }),
    });

    expect(response.statusCode).toBe(200);
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request.input).toContain("User prompt:\nWhat is the rate now?");
    expect(request.input).toContain("Trial answer (unverified;");
    expect(request.input).toContain("The rate is £7.55.");
    expect(request.instructions).toContain("**Guardrails**");
    expect(request.instructions).toContain("Distinguish a model error from a prompt omission");
    expect(request.instructions).toContain("Always require explicit human approval before sending messages");
    expect(request.instructions).toContain("Workflow Coach is the better place to map the whole flow");
  });

  it("sends an attachment with the trial answer and rejects files over the app limit", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ output_text: "A trial answer." }) });
    globalThis.fetch = fetchMock;
    const handler = loadHandler();
    const payload = {
      type: "chat",
      mode: "workflow",
      messages: [{ role: "user", content: "Summarise this policy." }],
      attachment: { name: "policy.txt", data: `data:text/plain;base64,${Buffer.from("Policy text").toString("base64")}` },
    };

    expect((await handler({ requestContext: { http: { method: "POST" } }, body: JSON.stringify(payload) })).statusCode).toBe(200);
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request.input[0].content[1].file_data).toBe(payload.attachment.data);
    expect(request.max_output_tokens).toBeGreaterThan(900);

    payload.attachment.data = `data:text/plain;base64,${Buffer.alloc(2 * 1024 * 1024 + 1).toString("base64")}`;
    expect((await handler({ requestContext: { http: { method: "POST" } }, body: JSON.stringify(payload) })).statusCode).toBe(413);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("adds returned web citations as visible markdown links", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        output: [{
          type: "message",
          content: [{
            type: "output_text",
            text: "The source supports this conclusion.",
            annotations: [{
              type: "url_citation",
              title: "Authoritative source",
              url: "https://example.test/source",
            }],
          }],
        }],
      }),
    });
    globalThis.fetch = fetchMock;

    const response = await loadHandler()({
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify({
        type: "critique",
        mode: "workflow",
        useWebSearch: true,
        messages: [{ role: "user", content: "Validate this claim." }],
      }),
    });

    expect(JSON.parse(response.body).content).toContain("[Authoritative source](https://example.test/source)");
  });

  it("does not return credential fragments from an OpenAI authentication error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: "Incorrect API key provided: secret-fragment" } }),
    });
    const response = await loadHandler()({
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify({ type: "chat", mode: "coach", messages: [{ role: "user", content: "Hello" }] }),
    });
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).error).toContain("OpenAI rejected the API key");
    expect(response.body).not.toContain("secret-fragment");
  });
});
