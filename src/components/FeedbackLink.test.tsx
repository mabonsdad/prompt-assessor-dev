import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatMessage } from "@/components/ChatMessage";
import type { Message } from "@/hooks/useChat";

describe("result feedback link", () => {
  it.each([
    ["coach", "Prompt Coach"],
    ["workflow", "Workflow Coach"],
  ] as const)("appears after a %s critique and opens an addressed email", (mode, coachName) => {
    const message: Message = {
      id: "assistant-1",
      role: "assistant",
      mode,
      content: "A trial answer.",
      isLoading: true,
    };
    const { rerender } = render(<ChatMessage message={message} />);
    expect(screen.queryByRole("link", { name: "Email feedback" })).not.toBeInTheDocument();

    rerender(<ChatMessage message={{ ...message, isLoading: false, critique: "# 7/10\nClear but could improve.\n---\n## What matters\n- Add context." }} />);
    const link = screen.getByRole("link", { name: "Email feedback" });
    const url = new URL(link.getAttribute("href")!);
    expect(url.protocol).toBe("mailto:");
    expect(url.pathname).toBe("feedback@shwsh.co.uk");
    expect(url.searchParams.get("subject")).toBe(`Prompt Assessor feedback (${coachName})`);
    expect(url.searchParams.has("body")).toBe(false);
  });
});
