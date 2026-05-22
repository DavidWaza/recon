"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

interface SendResult {
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  message: string;
}

export default function SendWaitlistMessagePage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isWeeklyRecommendation, setIsWeeklyRecommendation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data } = await axios.post("/api/admin/send-to-waitlist", {
        subject,
        message,
        isWeeklyRecommendation,
      });

      setResult(data);

      if (data.success) {
        toast.success(
          `Email sent to ${data.sent} users! ${data.failed > 0 ? `(${data.failed} failed)` : ""}`
        );
        setSubject("");
        setMessage("");
        setIsWeeklyRecommendation(false);
      } else {
        toast.error(data.error || "Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to send message");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            h1 { font-size: 28px !important; }
            .message { font-size: 15px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 32px 16px;">
          <tr>
            <td align="center">
              <table class="container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); background-color: #ffffff;">

                <!-- Header -->
                <tr>
                  <td style="background-color: #1b1f3b; padding: 48px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      🎬 ${isWeeklyRecommendation ? "This Week's Picks" : "recon"}
                    </h1>
                    <p style="margin: 12px 0 0; font-size: 16px; color: rgba(255,255,255,0.85); font-weight: 400;">
                      ${isWeeklyRecommendation ? "Your curated weekly selections" : ""}
                    </p>
                  </td>
                </tr

                <!-- Body -->
                <tr>
                  <td style="background-color: #ffffff; padding: 48px 40px;">
                    <div class="message" style="margin: 0 0 36px; font-size: 16px; color: #2a2a2a; line-height: 1.8;">
                      ${message.replace(/\n/g, "<br/><br/>")}
                    </div>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://recon-ruby.vercel.app" style="display: inline-block; background-color: #1b1f3b; color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(27,31,59,0.3);">
                            Explore Picks
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fb; padding: 32px 40px; border-top: 1px solid #e5e5e5; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      © 2026 recon. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-neutral-950 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Send to Waitlist
          </h1>
          <p className="text-neutral-400 text-lg">
            Compose and send messages or weekly movie recommendations to all
            registered waitlist users.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Compose Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subject Input */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-3">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., 🎬 This Week's Top Picks or New Movies Worth Watching"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            {/* Message Textarea */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <label className="block text-sm font-semibold text-white mb-3">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here. Include movie recommendations, descriptions, or any special announcement..."
                rows={10}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition resize-none"
              />
              <div className="mt-2 text-xs text-neutral-500">
                {message.length} characters
              </div>
            </div>

            {/* Options */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWeeklyRecommendation}
                  onChange={(e) => setIsWeeklyRecommendation(e.target.checked)}
                  className="w-5 h-5 accent-red-600"
                />
                <span className="text-white font-medium">
                  Mark as Weekly Recommendation
                </span>
              </label>
              <p className="text-neutral-500 text-sm mt-2 ml-8">
                This will update the email header to reflect a weekly picks
                message
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                disabled={!subject.trim() || !message.trim()}
                className="flex-1 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
              >
                {showPreview ? "Hide Preview" : "Preview Email"}
              </button>
              <button
                onClick={handleSend}
                disabled={
                  loading || !subject.trim() || !message.trim()
                }
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
              >
                {loading ? "Sending..." : "Send to All Users"}
              </button>
            </div>
          </div>

          {/* Sidebar - Stats & Info */}
          <div className="space-y-6">
            {/* Results */}
            {result && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Send Results
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-neutral-400 text-xs uppercase tracking-wide">
                      Successful
                    </p>
                    <p className="text-3xl font-bold text-green-500 mt-1">
                      {result.sent}
                    </p>
                  </div>
                  {result.failed > 0 && (
                    <div>
                      <p className="text-neutral-400 text-xs uppercase tracking-wide">
                        Failed
                      </p>
                      <p className="text-3xl font-bold text-red-500 mt-1">
                        {result.failed}
                      </p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-neutral-800">
                    <p className="text-neutral-400 text-xs uppercase tracking-wide">
                      Total
                    </p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {result.total}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Tips</h3>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span>Use engaging subject lines to improve open rates</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span>Keep messages concise and scannable</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span>Include specific movie recommendations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500 font-bold shrink-0">•</span>
                  <span>Preview before sending to all users</span>
                </li>
              </ul>
            </div>

            {/* Template Suggestions */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Quick Templates
              </h3>
              <button
                onClick={() => {
                  setSubject("🎬 This Week's Top Picks");
                  setMessage(
                    "We've curated this week's must-watch movies just for you. From thrilling action flicks to heartwarming dramas, there's something for everyone. Check them out and let us know your favorites!"
                  );
                  setIsWeeklyRecommendation(true);
                }}
                className="w-full mb-3 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded transition text-left"
              >
                Weekly Picks Template
              </button>
              <button
                onClick={() => {
                  setSubject("🎬 New Additions to Our Collection");
                  setMessage(
                    "We've just added some amazing new titles! These hidden gems are waiting for you. Discover what's new and join the conversation."
                  );
                  setIsWeeklyRecommendation(false);
                }}
                className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded transition text-left"
              >
                New Additions Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Email Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-neutral-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-white rounded-lg overflow-hidden">
                <iframe
                  srcDoc={generatePreview()}
                  title="Email Preview"
                  className="w-full h-96 border-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
