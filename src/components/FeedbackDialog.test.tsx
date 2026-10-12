import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatMessage } from "@/components/ChatMessage";
import type { Message } from "@/hooks/useChat";

describe("result feedback", () => {
  it("appears after the critique and drafts only the comment", () => {
    const message: Message = {
      id: "assistant-1",
      role: "assistant",
      mode: "coach",
      content: "A trial answer.",
      isLoading: true,
    };
    const { rerender } = render(<ChatMessage message={message} />);
    expect(screen.queryByRole("button", { name: "Send feedback" })).not.toBeInTheDocument();

    rerender(<ChatMessage message={{ ...message, isLoading: false, critique: "# 7/10\nClear but could improve.\n---\n## What matters\n- Add context." }} />);
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));

    const dialog = screen.getByRole("dialog", { name: "Send feedback" });
    expect(within(dialog).getByRole("button", { name: "Open email draft" })).toBeDisabled();
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Your comment" }), {
      target: { value: "  More visual detail, please & thanks.  " },
    });

    const draft = within(dialog).getByRole("link", { name: "Open email draft" });
    const url = new URL(draft.getAttribute("href")!);
    expect(url.protocol).toBe("mailto:");
    expect(url.pathname).toBe("feedback@shwsh.co.uk");
    expect(url.searchParams.get("subject")).toBe("Prompt Assessor feedback (Prompt Coach)");
    expect(url.searchParams.get("body")).toBe("More visual detail, please & thanks.");
    expect(draft.getAttribute("href")).not.toContain("A trial answer");
  });
});
