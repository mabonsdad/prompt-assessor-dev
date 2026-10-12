import type { ReviewMode } from "@/hooks/useChat";

export const FEEDBACK_EMAIL = "feedback@shwsh.co.uk";

export function feedbackMailtoUrl(mode: ReviewMode): string {
  const coachName = mode === "workflow" ? "Workflow Coach" : "Prompt Coach";
  const subject = `Prompt Assessor feedback (${coachName})`;
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
