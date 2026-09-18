"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  weeklyPicksEmailHtml,
  type WeeklyPick,
} from "@/lib/emails/weekly-picks";
import { GenrePicker } from "@/components/admin/GenrePicker";
import { EmailPreview, EditPreviewSwitch } from "@/components/admin/EmailPreview";
import {
  PageActions,
  PageDescription,
  PageEyebrow,
  PageHeader,
  PageHeading,
  PageTitle,
} from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Callout";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Field,
  FieldHeader,
  FieldHint,
  FieldLabel,
  Input,
  Select,
  Textarea,
} from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const IMDB_OPTIONS = [
  "10.0",
  "9.8",
  "9.7",
  "9.6",
  "9.5",
  "9.4",
  "9.3",
  "9.2",
  "9.1",
  "9.0",
  "8.9",
  "8.8",
  "8.7",
  "8.6",
  "8.5",
  "8.4",
  "8.3",
  "8.2",
  "8.1",
  "8.0",
  "7.9",
  "7.8",
  "7.7",
  "7.6",
  "7.5",
  "7.4",
  "7.3",
  "7.2",
  "7.1",
  "7.0",
  "6.9",
  "6.8",
  "6.7",
  "6.6",
  "6.5",
];

const PERSIST_KEY = "recon-admin-picks";

const EMPTY_PICK = {
  title: "",
  description: "",
  genre: "Action",
  imdb_rating: "8.0",
  poster_url: "",
  trailer_url: "",
  netflix_url: "",
};

type Pick = typeof EMPTY_PICK;

function toWeeklyPick(p: Pick, i: number): WeeklyPick {
  return {
    id: i + 1,
    title: p.title || "Untitled pick",
    genre: p.genre,
    description: p.description,
    imdb_rating: p.imdb_rating,
    poster_url: p.poster_url || undefined,
    trailer_url: p.trailer_url || undefined,
    netflix_url: p.netflix_url || undefined,
  };
}

export default function AdminPage() {
  const [picks, setPicks] = useState<Pick[]>([{ ...EMPTY_PICK }]);
  const [testEmail, setTestEmail] = useState("");
  const [busy, setBusy] = useState<null | "test" | "all">(null);
  const [result, setResult] = useState<{
    sent?: number;
    failed?: number;
    message?: string;
    error?: string;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

  const updatePick = (index: number, field: keyof Pick, value: string) => {
    setPicks((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const addPick = () => setPicks((prev) => [...prev, { ...EMPTY_PICK }]);

  const removePick = (index: number) => {
    setPicks((prev) => prev.filter((_, i) => i !== index));
    // Collapsed state is keyed by position, so shift everything after the
    // removed card down by one.
    setCollapsed((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  const toggleCollapsed = (index: number) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(PERSIST_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPicks(parsed);
      }
    } catch (error) {
      console.warn("Failed to restore admin picks:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(picks));
  }, [picks]);

  const validPickCount = picks.filter((pick) => pick.title.trim()).length;
  const withWatchLink = picks.filter((p) => p.netflix_url.trim()).length;
  const withPoster = picks.filter((p) => p.poster_url.trim()).length;
  const withTrailer = picks.filter((p) => p.trailer_url.trim()).length;

  const previewHtml = weeklyPicksEmailHtml(
    testEmail || "you@email.com",
    picks.map(toWeeklyPick),
  );

  const send = async (mode: "test" | "all") => {
    if (validPickCount === 0) {
      const error = "Add at least one pick with a title before sending.";
      setResult({ error });
      toast.error(error);
      return;
    }
    if (mode === "test" && !testEmail.trim()) {
      toast.error("Enter a test email address");
      return;
    }

    setBusy(mode);
    setResult(null);
    try {
      const { data } = await axios.post(
        "/api/admin/send-picks",
        {
          mode,
          testEmail: mode === "test" ? testEmail.trim() : undefined,
          picks: picks.map((p) => ({
            ...p,
            imdb_rating: parseFloat(p.imdb_rating),
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY}`,
          },
        },
      );
      setResult(data);
      if (data.success) {
        toast.success(data.message ?? `Sent to ${data.sent} subscriber(s)`);
        // Keep the picks after a broadcast so the list can be re-sent if not
        // every subscriber was reached in one pass.
      } else {
        toast.error(data.error ?? "Failed to send");
      }
    } catch (err) {
      const error = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Something went wrong")
        : "Something went wrong";
      setResult({ error });
      toast.error(error);
    } finally {
      setBusy(null);
    }
  };

  const requestSend = () => {
    if (validPickCount === 0) {
      setResult({ error: "Add at least one pick with a title before sending." });
      return;
    }
    setShowConfirmModal(true);
  };

  return (
    <>
      <ConfirmDialog
        open={showConfirmModal}
        title="Send weekly picks to all subscribers?"
        description={`This will save ${validPickCount} pick${validPickCount !== 1 ? "s" : ""} and email every active subscriber immediately. This cannot be undone.`}
        confirmLabel="Yes, send picks"
        onConfirm={() => {
          setShowConfirmModal(false);
          void send("all");
        }}
        onCancel={() => setShowConfirmModal(false)}
        loading={busy === "all"}
      />

      <PageHeader>
        <PageHeading>
          <PageEyebrow>
            <Icon name="calendar" className="size-3.5" />
            Friday send
          </PageEyebrow>
          <PageTitle>Weekly picks</PageTitle>
          <PageDescription>
            Build this week&apos;s list, send a test to yourself, then broadcast
            to every subscriber. Drafts save to this browser automatically.
          </PageDescription>
        </PageHeading>
        <PageActions>
          <Badge tone={validPickCount > 0 ? "info" : "neutral"} dot size="lg">
            {validPickCount > 0
              ? `${validPickCount} ready to send`
              : "Draft"}
          </Badge>
        </PageActions>
      </PageHeader>

      {/* Draft health — tells you at a glance what's still missing. */}
      <section
        aria-label="Draft checklist"
        className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <Checkpoint icon="film" label="Titled" value={validPickCount} total={picks.length} />
        <Checkpoint icon="photo" label="Posters" value={withPoster} total={picks.length} />
        <Checkpoint icon="play" label="Trailers" value={withTrailer} total={picks.length} />
        <Checkpoint icon="link" label="Watch links" value={withWatchLink} total={picks.length} />
      </section>

      <EditPreviewSwitch value={mobileView} onChange={setMobileView} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] xl:gap-8">
        {/* ---------------- Editor ---------------- */}
        <div className={cn("min-w-0 space-y-4", mobileView === "preview" && "hidden lg:block")}>
          {picks.map((pick, i) => {
            const isCollapsed = collapsed.has(i);
            return (
              <Card key={i} className="gap-0 py-0 sm:gap-0 sm:py-0">
                <CardHeader className="py-3.5 sm:py-4">
                  <button
                    type="button"
                    onClick={() => toggleCollapsed(i)}
                    aria-expanded={!isCollapsed}
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <PosterThumb key={pick.poster_url} url={pick.poster_url} index={i} />
                    <span className="min-w-0">
                      <CardTitle className="truncate">
                        {pick.title.trim() || `Pick #${i + 1}`}
                      </CardTitle>
                      <CardDescription className="truncate">
                        ★ {pick.imdb_rating} · {pick.genre || "No genre"}
                      </CardDescription>
                    </span>
                  </button>
                  <CardAction>
                    {picks.length > 1 && (
                      <Button
                        color="destructive"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removePick(i)}
                        aria-label={`Remove pick ${i + 1}`}
                      >
                        <Icon name="trash" />
                      </Button>
                    )}
                    <Button
                      color="secondary"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleCollapsed(i)}
                      aria-label={isCollapsed ? "Expand pick" : "Collapse pick"}
                    >
                      <Icon
                        name="chevron-down"
                        className={cn("transition-transform", !isCollapsed && "rotate-180")}
                      />
                    </Button>
                  </CardAction>
                </CardHeader>

                {!isCollapsed && (
                  <CardContent className="grid gap-5 border-t border-border py-5">
                    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_9rem]">
                      <Field>
                        <FieldLabel htmlFor={`title-${i}`}>Title</FieldLabel>
                        <Input
                          id={`title-${i}`}
                          value={pick.title}
                          onChange={(e) => updatePick(i, "title", e.target.value)}
                          placeholder="Movie title"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`rating-${i}`}>IMDb</FieldLabel>
                        <Select
                          id={`rating-${i}`}
                          value={pick.imdb_rating}
                          onChange={(e) => updatePick(i, "imdb_rating", e.target.value)}
                        >
                          {IMDB_OPTIONS.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>

                    <Field>
                      <FieldHeader>
                        <FieldLabel htmlFor={`desc-${i}`}>Description</FieldLabel>
                        <FieldHint>{pick.description.length} chars</FieldHint>
                      </FieldHeader>
                      <Textarea
                        id={`desc-${i}`}
                        rows={4}
                        value={pick.description}
                        onChange={(e) => updatePick(i, "description", e.target.value)}
                        placeholder="A concise overview of the pick, styled for the newsletter."
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Genres</FieldLabel>
                      <GenrePicker
                        value={pick.genre}
                        onChange={(genre) => updatePick(i, "genre", genre)}
                      />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor={`trailer-${i}`}>Trailer URL</FieldLabel>
                        <Input
                          id={`trailer-${i}`}
                          type="url"
                          inputMode="url"
                          value={pick.trailer_url}
                          onChange={(e) => updatePick(i, "trailer_url", e.target.value)}
                          placeholder="YouTube trailer link"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`poster-${i}`}>Poster URL</FieldLabel>
                        <Input
                          id={`poster-${i}`}
                          type="url"
                          inputMode="url"
                          value={pick.poster_url}
                          onChange={(e) => updatePick(i, "poster_url", e.target.value)}
                          placeholder="Cover image link"
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldHeader>
                        <FieldLabel htmlFor={`watch-${i}`}>Watch link</FieldLabel>
                        <FieldHint>Netflix, Prime, Max…</FieldHint>
                      </FieldHeader>
                      <Input
                        id={`watch-${i}`}
                        type="url"
                        inputMode="url"
                        value={pick.netflix_url}
                        onChange={(e) => updatePick(i, "netflix_url", e.target.value)}
                        placeholder="Where to watch link"
                      />
                    </Field>
                  </CardContent>
                )}
              </Card>
            );
          })}

          <button
            type="button"
            onClick={addPick}
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong text-sm font-semibold text-muted transition-colors hover:border-accent-500/60 hover:bg-accent-50/50 hover:text-foreground"
          >
            <span className="flex size-7 items-center justify-center rounded-full border border-border bg-surface transition-colors group-hover:border-accent-500 group-hover:bg-accent-500 group-hover:text-base-950">
              <Icon name="plus" className="size-4" weight={2.25} />
            </span>
            Add another pick
          </button>

          {/* ---------------- Send ---------------- */}
          <Card className="border-accent-150/70">
            <CardHeader>
              <CardTitle>
                <Icon name="send" className="size-4 text-accent-500" />
                Test, then broadcast
              </CardTitle>
              <CardDescription>
                A test sends these exact picks to one address. Nothing is saved
                or sent to subscribers until you broadcast.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Test email address"
                />
                <Button
                  color="secondary"
                  onClick={() => send("test")}
                  disabled={busy !== null}
                  loading={busy === "test"}
                  className="sm:w-auto"
                  block
                >
                  {busy === "test" ? "Sending…" : "Send test"}
                </Button>
              </div>

              <Button
                size="lg"
                block
                onClick={requestSend}
                disabled={busy !== null}
                loading={busy === "all"}
              >
                {busy === "all" ? (
                  "Sending…"
                ) : (
                  <>
                    <Icon name="send" />
                    Save picks &amp; send to all subscribers
                  </>
                )}
              </Button>

              {result && (
                <Callout tone={result.error ? "danger" : result.failed ? "attention" : "success"}>
                  {result.error
                    ? result.error
                    : (result.message ??
                      `Sent to ${result.sent} subscriber${result.sent !== 1 ? "s" : ""}${result.failed ? ` (${result.failed} failed)` : ""}`)}
                </Callout>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ---------------- Preview ---------------- */}
        <EmailPreview
          html={previewHtml}
          className={cn(mobileView === "edit" && "hidden lg:flex")}
        />
      </div>
    </>
  );
}

function Checkpoint({
  icon,
  label,
  value,
  total,
}: {
  icon: "film" | "photo" | "play" | "link";
  label: string;
  value: number;
  total: number;
}) {
  const done = total > 0 && value === total;
  const pct = total === 0 ? 0 : (value / total) * 100;
  return (
    <div className="rounded-2xl border border-border bg-surface p-3.5 shadow-card sm:p-4">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg border",
            done
              ? "border-green-150 bg-green-50 text-green-500"
              : "border-border bg-base-100 text-muted",
          )}
        >
          <Icon name={done ? "check" : icon} className="size-4" weight={done ? 2.25 : 1.75} />
        </span>
        <span className="text-lg font-semibold tabular-nums text-foreground">
          {value}
          <span className="text-sm font-medium text-subtle">/{total}</span>
        </span>
      </div>
      <p className="mt-2.5 text-xs font-medium text-muted">{label}</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-base-150">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", done ? "bg-green-500" : "bg-accent-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PosterThumb({ url, index }: { url: string; index: number }) {
  // Reset on a new URL comes from the caller keying this by url.
  const [failed, setFailed] = useState(false);

  if (!url.trim() || failed) {
    return (
      <span className="flex h-12 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-base-100 text-xs font-bold tabular-nums text-subtle">
        {index + 1}
      </span>
    );
  }
  return (
    // Admin can paste any host, so this can't go through next/image's allowlist.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      onError={() => setFailed(true)}
      className="h-12 w-9 shrink-0 rounded-md object-cover ring-1 ring-border"
    />
  );
}
