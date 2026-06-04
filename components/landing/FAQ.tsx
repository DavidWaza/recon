"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is Recon?",
    answer:
      "Recon is a free weekly newsletter that delivers curated, high-rated Netflix movie recommendations straight to your inbox every Friday. We cross-reference IMDb ratings to ensure you only get quality picks worth your time.",
  },
  {
    question: "How much does Recon cost?",
    answer:
      "Recon is completely free. There are no premium tiers, hidden fees, or paywalls. We're movie enthusiasts who built this service because we believe everyone deserves great movie nights.",
  },
  {
    question: "How often will I receive emails?",
    answer:
      "Once per week, every Friday. We respect your inbox — you'll never receive more than one email per week from us, and we will never send you spam or promotional content.",
  },
  {
    question: "Do I need a Netflix subscription?",
    answer:
      "Yes, Recon is designed specifically for Netflix subscribers. All our recommendations are movies currently available on Netflix, with direct links so you can start watching immediately.",
  },
  {
    question: "How do you select the movies?",
    answer:
      "We combine IMDb community ratings with human curation. Our team watches and evaluates films to ensure each recommendation delivers on storytelling quality, not just popularity metrics.",
  },
  {
    question: "Can I unsubscribe at any time?",
    answer:
      "Absolutely. Every email includes a one-click unsubscribe link at the bottom. Your data will be removed immediately upon unsubscription. No questions asked.",
  },
  {
    question: "Is my data safe with Recon?",
    answer:
      "We only collect your email address — nothing else. We never sell, share, or trade your information with third parties. Your data is stored securely and used solely for delivering your weekly picks. Read our Privacy Policy for full details.",
  },
];

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/[0.06]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-6 text-left transition-colors duration-200 hover:text-accent"
        aria-expanded={isOpen}
      >
        <span className="pr-4 text-[15px] font-medium text-white sm:text-base">
          {faq.question}
        </span>
        <span
          className={[
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-muted transition-all duration-300",
            isOpen ? "rotate-45 border-accent/30 text-accent" : "",
          ].join(" ")}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-12 text-sm leading-relaxed text-muted">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden border-t border-white/[0.04] py-28">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 bottom-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-accent">
            Questions?
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 backdrop-blur-sm sm:px-8"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
