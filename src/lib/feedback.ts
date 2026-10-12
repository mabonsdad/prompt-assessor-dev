import type { ReviewMode } from "@/hooks/useChat";

export const FEEDBACK_EMAIL = "feedback@shwsh.co.uk";
export const MAX_FEEDBACK_LENGTH = 1000;

export function feedbackDraftUrl(comment: string, mode: ReviewMode): string {
  const coachName = mode === "workflow" ? "Workflow Coach" : "Prompt Coach";
  const subject = `Prompt Assessor feedback (${coachName})`;
  const body = comment.trim().slice(0, MAX_FEEDBACK_LENGTH);

  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
