"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { newsEmailHtml } from "@/lib/emails/news";
import {
  cloudinaryConfigured,
  uploadImageToCloudinary,
} from "@/services/cloudinary";
import { SITE_URL } from "@/lib/urls";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showCta, setShowCta] = useState(false);
  const [ctaText, setCtaText] = useState("Browse this week's picks");
  const [ctaUrl, setCtaUrl] = useState(SITE_URL);
  const [testEmail, setTestEmail] = useState("");

  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState<null | "test" | "all">(null);
  const [result, setResult] = useState<SendResult | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const previewHtml = newsEmailHtml({
    title: title.trim() || subject.trim() || "Your headline here",
    body: body.trim() || "Your message will appear here…",
    images,
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
          title,
          body,
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

  const inputClass =
    "w-full rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20";

  return (
    <div className="min-h-screen bg-background p-6 sm:p-8">
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
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Admin
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">News &amp; Updates</h1>
          <p className="mt-1 text-sm text-muted">
            Compose an announcement, upload images, send a test to yourself, then
            broadcast to every active subscriber.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(360px,520px)]">
          {/* Compose */}
          <div className="space-y-5">
            <Field label="Subject line">
              <input
                className={inputClass}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="The inbox subject your subscribers see"
              />
            </Field>

            <Field label="Headline" hint="Shown inside the email. Defaults to the subject if blank.">
              <input
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Big news this week"
              />
            </Field>

            <Field label="Message" hint={`${body.length} characters · blank lines start new paragraphs`}>
              <textarea
                className={`${inputClass} resize-none`}
                rows={9}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your update here…"
              />
            </Field>

            {/* Images */}
            <Field label="Images" hint="Uploaded to Cloudinary and embedded in the email, in order.">
              <div className="rounded-xl border border-dashed border-border bg-black/20 p-4">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 py-4 text-center">
                  <span className="text-sm font-medium text-white">
                    {uploading ? "Uploading…" : "Click to upload images"}
                  </span>
                  <span className="text-xs text-muted">PNG, JPG, GIF · multiple allowed</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) => {
                      handleFiles(e.target.files);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>

                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {images.map((url, i) => (
                      <div key={url} className="group relative overflow-hidden rounded-lg ring-1 ring-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          aria-label="Remove image"
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            {/* CTA */}
            <div className="rounded-xl border border-border bg-card p-5">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Include call-to-action button
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Add a &ldquo;Browse this week&apos;s picks&rdquo; button at
                    the bottom of the email.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showCta}
                  onChange={(e) => setShowCta(e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded border-border bg-black/30 text-accent focus:ring-accent/30"
                />
              </label>

              {showCta && (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field label="Button text">
                    <input
                      className={inputClass}
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Browse this week's picks"
                    />
                  </Field>
                  <Field label="Button link">
                    <input
                      className={inputClass}
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder={SITE_URL}
                    />
                  </Field>
                </div>
              )}
            </div>

            {/* Test + Send */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-white">Test before you broadcast</p>
              <p className="mt-1 text-xs text-muted">
                Send this exact email to one address first. Nothing goes to
                subscribers until you hit broadcast.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  className={inputClass}
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="you@email.com"
                />
                <button
                  type="button"
                  onClick={() => send("test")}
                  disabled={busy !== null}
                  className="shrink-0 rounded-full border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/20 disabled:opacity-50"
                >
                  {busy === "test" ? "Sending…" : "Send test to myself"}
                </button>
              </div>

              <button
                type="button"
                onClick={requestBroadcast}
                disabled={busy !== null}
                className="mt-4 w-full rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/25 transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {busy === "all" ? "Broadcasting…" : "Send to all subscribers"}
              </button>

              {result && (
                <div
                  className={`mt-4 rounded-lg border p-3 text-sm ${
                    result.success
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  {result.success
                    ? `✅ ${result.message}`
                    : `❌ ${result.error ?? result.message}`}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Live preview
              </p>
              <button
                type="button"
                onClick={() => setShowPreview((s) => !s)}
                className="text-xs text-muted transition-colors hover:text-white"
              >
                {showPreview ? "Hide" : "Show"}
              </button>
            </div>
            {showPreview && (
              <div className="overflow-hidden rounded-xl border border-border bg-white">
                <iframe
                  srcDoc={previewHtml}
                  title="Email preview"
                  className="h-[680px] w-full border-0"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </label>
        {hint && <span className="text-[11px] text-muted/70">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
