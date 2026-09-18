"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { sendSiteFeedback } from "@/services/site-feedback";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Field, FieldHeader, FieldHint, FieldLabel, Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

const RATINGS = [1, 2, 3, 4, 5];

export function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const remaining = 2000 - message.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const text = message.trim();
    if (!text) {
      toast.error("Please write a message before sending.");
      return;
    }

    setBusy(true);
    try {
      await sendSiteFeedback({
        message: text,
        rating,
        email: email.trim() || undefined,
      });
      setDone(true);
      toast.success("Thanks — we read every message.");
    } catch (error) {
      const msg =
        axios.isAxiosError(error) && error.response?.data?.error
          ? (error.response.data.error as string)
          : "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="feedback" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="surface-glow rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-8"
        >
          {done ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-green-150 bg-green-50 text-green-500">
                <Icon name="check-circle" className="size-7" weight={1.5} />
              </div>
              <h2 className="mt-4 text-xl font-bold text-foreground">Thanks for the feedback</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                We read every message — it genuinely shapes what lands in your inbox on Friday.
              </p>
              <Button
                color="secondary"
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setDone(false);
                  setMessage("");
                  setRating(null);
                  setEmail("");
                }}
              >
                Send another
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-accent-150 bg-accent-50 text-accent-500">
                  <Icon name="chat" />
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    Tell us what you think
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Missing a platform? Picks not landing? Tell us — it shapes what we send.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 grid gap-5">
                <Field>
                  <FieldHeader>
                    <FieldLabel id="feedback-rating-label">How are we doing?</FieldLabel>
                    <FieldHint>Optional</FieldHint>
                  </FieldHeader>
                  <div
                    role="group"
                    aria-labelledby="feedback-rating-label"
                    className="flex items-center gap-1"
                    onMouseLeave={() => setHovered(null)}
                  >
                    {RATINGS.map((n) => {
                      const active = (hovered ?? rating ?? 0) >= n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(rating === n ? null : n)}
                          onMouseEnter={() => setHovered(n)}
                          aria-label={`${n} out of 5`}
                          aria-pressed={rating === n}
                          className={cn(
                            "flex size-11 items-center justify-center rounded-xl text-2xl leading-none transition-[transform,color] hover:scale-110",
                            active ? "text-yellow-500" : "text-base-500",
                          )}
                        >
                          <span aria-hidden>★</span>
                        </button>
                      );
                    })}
                    {rating !== null && (
                      <span className="pl-2 text-sm font-medium tabular-nums text-muted">{rating}/5</span>
                    )}
                  </div>
                </Field>

                <Field>
                  <FieldHeader>
                    <FieldLabel htmlFor="feedback-message">Your feedback</FieldLabel>
                    <FieldHint className={cn(remaining < 100 && "text-yellow-500")}>
                      {remaining} left
                    </FieldHint>
                  </FieldHeader>
                  <Textarea
                    id="feedback-message"
                    required
                    rows={4}
                    maxLength={2000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What would make Recon better?"
                  />
                </Field>

                <Field>
                  <FieldHeader>
                    <FieldLabel htmlFor="feedback-email">Email</FieldLabel>
                    <FieldHint>Optional, if you want a reply</FieldHint>
                  </FieldHeader>
                  <Input
                    id="feedback-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </Field>

                <Button type="submit" size="lg" block loading={busy} disabled={!message.trim()}>
                  {busy ? "Sending…" : "Send feedback"}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
