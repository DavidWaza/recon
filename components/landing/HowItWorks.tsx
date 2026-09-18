"use client";

import { motion } from "framer-motion";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Section, SectionContainer, SectionHeader } from "./Section";

const steps: { number: string; title: string; description: string; icon: IconName }[] = [
  {
    number: "01",
    title: "We curate",
    description:
      "Every week, we scan what's streaming across Netflix, Prime Video, Max, Apple TV+ and more, then cross-reference IMDb ratings to surface hidden gems and critically acclaimed films you might have missed.",
    icon: "search",
  },
  {
    number: "02",
    title: "You receive",
    description:
      "Every Friday, a beautifully designed email lands in your inbox with our top picks — each with IMDb ratings, trailers, and a direct link to wherever it's streaming.",
    icon: "mail",
  },
  {
    number: "03",
    title: "You watch",
    description:
      "Open the app it's on, hit play, and enjoy a movie you know is worth your time. No more scrolling across a dozen services wondering what to watch.",
    icon: "play",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute left-1/4 top-1/3 size-[25rem] rounded-full bg-accent-500/5 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 size-[19rem] rounded-full bg-flow-secondary/5 blur-[100px]" />
      </div>

      <SectionContainer>
        <SectionHeader
          eyebrow="Simple & effective"
          title="How Recon works"
          lead="We do the research so you don't have to. Three simple steps to better movie nights."
        />

        {/* Phones: a vertical timeline. md+: three cards in a row. */}
        <div className="relative">
          <div aria-hidden className="absolute bottom-8 left-[1.6rem] top-8 w-px bg-linear-to-b from-accent-500/50 via-accent-500/20 to-transparent md:hidden" />
        <ol className="relative grid gap-4 md:grid-cols-3 md:gap-6">
          {steps.map((step, i) => (
            <motion.li
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
              className="group relative flex gap-4 md:block"
            >
              <div className="relative z-10 flex size-[3.25rem] shrink-0 items-center justify-center rounded-2xl border border-accent-150 bg-base-50 text-accent-500 shadow-card md:hidden">
                <Icon name={step.icon} className="size-6" weight={1.5} />
              </div>

              <div className="surface-glow relative h-full flex-1 overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-colors duration-300 sm:p-7 md:hover:border-accent-500/30">
                <span
                  aria-hidden
                  className="absolute right-5 top-4 text-4xl font-black tabular-nums text-base-950/4 transition-colors group-hover:text-accent-500/10 sm:text-5xl"
                >
                  {step.number}
                </span>

                <div className="mb-5 hidden size-12 items-center justify-center rounded-xl border border-accent-150 bg-accent-50 text-accent-500 md:flex">
                  <Icon name={step.icon} className="size-6" weight={1.5} />
                </div>

                <p className="mb-1 text-xs font-semibold tabular-nums text-accent-500 md:hidden">
                  Step {step.number}
                </p>
                <h3 className="mb-2 text-lg font-bold text-foreground sm:text-xl">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted sm:text-[15px]">{step.description}</p>
              </div>
            </motion.li>
          ))}
        </ol>
        </div>
      </SectionContainer>
    </Section>
  );
}
