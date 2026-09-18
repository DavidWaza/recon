"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { newsEmailHtml, parseStepsFromText } from "@/lib/emails/news";
import {
  cloudinaryConfigured,
  uploadImageToCloudinary,
} from "@/services/cloudinary";
import { SITE_URL } from "@/lib/urls";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmailPreview, EditPreviewSwitch } from "@/components/admin/EmailPreview";
import {
  PageDescription,
  PageEyebrow,
  PageHeader,
  PageHeading,
  PageTitle,
} from "@/components/admin/PageHeader";
import { Button, Spinner } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import {
  Card,
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
  Switch,
  Textarea,
} from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface SendResult {
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  message: string;
  error?: string;
}

const ADMIN_AUTH = `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY}`;

export default function AdminNewsPage() {
  const [subject, setSubject] = useState("");
  const [kicker, setKicker] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showCta, setShowCta] = useState(false);
  const [ctaText, setCtaText] = useState("Browse this week's picks");
  const [ctaUrl, setCtaUrl] = useState(SITE_URL);
  const [testEmail, setTestEmail] = useState("");

  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState<null | "test" | "all">(null);
  const [result, setResult] = useState<SendResult | null>(null);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const resolvedTitle =
    title.trim() || subject.trim() || "Your headline here";
  const resolvedSteps = parseStepsFromText(stepsText);

  const previewHtml = newsEmailHtml({
    title: resolvedTitle,
    kicker: kicker.trim() || undefined,
    body: body.trim() || "Your message will appear here…",
    images,
    steps: resolvedSteps,
    ctaText: showCta ? ctaText.trim() || undefined : undefined,
    ctaUrl: showCta ? ctaUrl.trim() || undefined : undefined,
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!cloudinaryConfigured) {
      toast.error(
        "Cloudinary isn't configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
      );
      return;
    }

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const url = await uploadImageToCloudinary(file);
        uploaded.push(url);
      }
      if (uploaded.length) {
        setImages((prev) => [...prev, ...uploaded]);
        toast.success(
          `Uploaded ${uploaded.length} image${uploaded.length > 1 ? "s" : ""}`,
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const send = async (mode: "test" | "all") => {
    if (!subject.trim()) return toast.error("Subject is required");
    if (!body.trim()) return toast.error("Message is required");
    if (mode === "test" && !testEmail.trim())
      return toast.error("Enter a test email address");

    setBusy(mode);
    setResult(null);
    try {
      const { data } = await axios.post<SendResult>(
        "/api/admin/send-to-waitlist",
        {
          mode,
          subject,
          kicker,
          title,
          body,
          stepsText,
          images,
          ctaText: showCta ? ctaText : undefined,
          ctaUrl: showCta ? ctaUrl : undefined,
          testEmail: mode === "test" ? testEmail.trim() : undefined,
        },
        { headers: { Authorization: ADMIN_AUTH } },
      );

      setResult(data);
      if (data.success) {
        toast.success(data.message);
        if (mode === "all") {
          setSubject("");
          setTitle("");
          setBody("");
          setImages([]);
        }
      } else {
        toast.error(data.error || "Failed to send");
      }
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? (error.response?.data?.error ?? "Failed to send")
        : "An unexpected error occurred";
      toast.error(msg);
      setResult({ success: false, sent: 0, failed: 0, total: 0, message: msg, error: msg });
    } finally {
      setBusy(null);
    }
  };

  const requestBroadcast = () => {
    if (!subject.trim()) return toast.error("Subject is required");
    if (!body.trim()) return toast.error("Message is required");
    setShowConfirmModal(true);
  };

  return (
    <>
      <ConfirmDialog
        open={showConfirmModal}
        title="Send to all subscribers?"
        description="This will email every active subscriber immediately. Send a test to yourself first if you haven't reviewed the message yet."
        confirmLabel="Yes, send to all"
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
            <Icon name="megaphone" className="size-3.5" />
            Broadcast
          </PageEyebrow>
          <PageTitle>News &amp; updates</PageTitle>
          <PageDescription>
            Compose an announcement, add images, send a test to yourself, then
            broadcast to every active subscriber.
          </PageDescription>
        </PageHeading>
      </PageHeader>

      <EditPreviewSwitch value={mobileView} onChange={setMobileView} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] xl:gap-8">
        {/* ---------------- Compose ---------------- */}
        <div className={cn("min-w-0 space-y-4", mobileView === "preview" && "hidden lg:block")}>
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
              <CardDescription>What lands in the inbox, top to bottom.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <Field>
                <FieldLabel htmlFor="subject">Subject line</FieldLabel>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="The inbox subject your subscribers see"
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldHeader>
                    <FieldLabel htmlFor="kicker">Eyebrow</FieldLabel>
                    <FieldHint>Optional</FieldHint>
                  </FieldHeader>
                  <Input
                    id="kicker"
                    value={kicker}
                    onChange={(e) => setKicker(e.target.value)}
                    placeholder="A QUICK FAVOR"
                  />
                </Field>
                <Field>
                  <FieldHeader>
                    <FieldLabel htmlFor="headline">Headline</FieldLabel>
                    <FieldHint>Defaults to subject</FieldHint>
                  </FieldHeader>
                  <Input
                    id="headline"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Help us get to **know you.**"
                  />
                </Field>
              </div>
              <FieldHint className="-mt-3">
                Wrap words in **asterisks** for the orange accent in the headline.
              </FieldHint>

              <Field>
                <FieldHeader>
                  <FieldLabel htmlFor="body">Message</FieldLabel>
                  <FieldHint>{body.length} chars</FieldHint>
                </FieldHeader>
                <Textarea
                  id="body"
                  rows={9}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your update here…"
                />
                <FieldHint>Blank lines start new paragraphs.</FieldHint>
              </Field>

              <Field>
                <FieldHeader>
                  <FieldLabel htmlFor="steps">Numbered steps</FieldLabel>
                  <FieldHint>Optional</FieldHint>
                </FieldHeader>
                <Textarea
                  id="steps"
                  rows={6}
                  value={stepsText}
                  onChange={(e) => setStepsText(e.target.value)}
                  placeholder={`Your favorite genres\nCheck the genres you reach for most.\n\nWhat's not for you\nSo we never recommend something you'd skip.`}
                />
                <FieldHint>Blank line between steps · first line of each is its title.</FieldHint>
              </Field>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>
                Uploaded to Cloudinary and embedded in the email, in order.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <label
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-sunken px-4 py-7 text-center transition-colors hover:border-accent-500/60 hover:bg-accent-50/40",
                  uploading && "pointer-events-none opacity-70",
                )}
              >
                <span className="flex size-11 items-center justify-center rounded-full border border-border bg-base-100 text-accent-500">
                  {uploading ? <Spinner className="size-5" /> : <Icon name="upload" />}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {uploading ? "Uploading…" : "Tap to upload images"}
                </span>
                <span className="text-xs text-subtle">PNG, JPG, GIF · multiple allowed</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                  className="sr-only"
                />
              </label>

              {images.length > 0 && (
                <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {images.map((url, i) => (
                    <li key={url} className="relative overflow-hidden rounded-lg ring-1 ring-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="aspect-square w-full object-cover" />
                      <span className="absolute left-1.5 top-1.5 rounded-md bg-base-0/75 px-1.5 text-[10px] font-bold tabular-nums text-foreground">
                        {i + 1}
                      </span>
                      {/* Always visible: touch devices have no hover to reveal it. */}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        aria-label={`Remove image ${i + 1}`}
                        className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-full bg-base-0/80 text-foreground backdrop-blur transition-colors hover:bg-red-600"
                      >
                        <Icon name="close" className="size-4" weight={2.25} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* CTA */}
          <Card>
            <CardHeader>
              <label htmlFor="cta-toggle" className="flex cursor-pointer items-start justify-between gap-4">
                <span>
                  <CardTitle>Call-to-action button</CardTitle>
                  <CardDescription className="mt-1">
                    Add a &ldquo;Browse this week&apos;s picks&rdquo; button at the bottom of the email.
                  </CardDescription>
                </span>
                <Switch
                  id="cta-toggle"
                  checked={showCta}
                  onChange={(e) => setShowCta(e.target.checked)}
                  className="mt-0.5"
                />
              </label>
            </CardHeader>

            {showCta && (
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="cta-text">Button text</FieldLabel>
                  <Input
                    id="cta-text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Browse this week's picks"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cta-url">Button link</FieldLabel>
                  <Input
                    id="cta-url"
                    type="url"
                    inputMode="url"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder={SITE_URL}
                  />
                </Field>
              </CardContent>
            )}
          </Card>

          {/* Test + Send */}
          <Card className="border-accent-150/70">
            <CardHeader>
              <CardTitle>
                <Icon name="send" className="size-4 text-accent-500" />
                Test, then broadcast
              </CardTitle>
              <CardDescription>
                Send this exact email to one address first. Nothing goes to
                subscribers until you hit broadcast.
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
                onClick={requestBroadcast}
                disabled={busy !== null}
                loading={busy === "all"}
              >
                {busy === "all" ? (
                  "Broadcasting…"
                ) : (
                  <>
                    <Icon name="megaphone" />
                    Send to all subscribers
                  </>
                )}
              </Button>

              {result && (
                <Callout
                  tone={!result.success ? "danger" : result.failed ? "attention" : "success"}
                >
                  {result.success ? result.message : (result.error ?? result.message)}
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
