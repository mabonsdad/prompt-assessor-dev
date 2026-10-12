import { useId, useState } from "react";
import { MessageSquareText } from "lucide-react";
import type { ReviewMode } from "@/hooks/useChat";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FEEDBACK_EMAIL, MAX_FEEDBACK_LENGTH, feedbackDraftUrl } from "@/lib/feedback";

interface FeedbackDialogProps {
  mode: ReviewMode;
}

export function FeedbackDialog({ mode }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const inputId = useId();
  const draftUrl = comment.trim() ? feedbackDraftUrl(comment, mode) : "";
  const actionClass = "inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md py-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          Send feedback
        </button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-2rem)] max-w-md gap-4 rounded-2xl p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Write a comment about this result. Your email app will open a draft to {FEEDBACK_EMAIL}; you review and send it there.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">Your comment</label>
          <textarea
            id={inputId}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={MAX_FEEDBACK_LENGTH}
            rows={4}
            placeholder="What worked, or what could be better?"
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground">
            Only this comment and the coach mode are included. Your prompt, result and attachments are not added automatically. Avoid confidential details.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <button type="button" className="min-h-10 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary">Cancel</button>
          </DialogClose>
          {draftUrl ? (
            <a href={draftUrl} onClick={() => setOpen(false)} className={actionClass}>Open email draft</a>
          ) : (
            <button type="button" disabled className={`${actionClass} cursor-not-allowed opacity-50`}>Open email draft</button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
