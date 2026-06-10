"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "We curate",
    description:
      "Every week, we scan what's streaming across Netflix, Prime Video, Max, Apple TV+ and more, then cross-reference IMDb ratings to surface hidden gems and critically acclaimed films you might have missed.",
    icon: (
      <svg
        className="h-7 w-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "You receive",
    description:
      "Every Friday, a beautifully designed email lands in your inbox with our top picks — each with IMDb ratings, trailers, and a direct link to wherever it's streaming.",
    icon: (
      <svg
        className="h-7 w-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "You watch",
    description:
      "Open the app it's on, hit play, and enjoy a movie you know is worth your time. No more scrolling across a dozen services wondering what to watch.",
    icon: (
      <svg
        className="h-7 w-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
        />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-28">
      {/* Background decorations */}
      <div className="absolute left-0 top-0 h-full w-full">
        <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-accent">
            Simple & effective
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            How Recon Works
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            We do the research so you don&apos;t have to. Three simple steps to
            better movie nights.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                delay: i * 0.15,
                duration: 0.6,
                ease: "easeOut",
              }}
              className="group relative"
            >
              {/* Connector line between cards (except last) */}
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-20 hidden h-px w-6 bg-gradient-to-r from-accent/40 to-transparent md:block" />
              )}

              <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-500 hover:border-accent/20 hover:bg-white/[0.04] hover:shadow-[0_20px_60px_-20px_rgba(79,70,229,0.15)]">
                {/* Step number accent */}
                <div className="absolute right-6 top-6 text-5xl font-black text-white/[0.03] transition-colors duration-500 group-hover:text-accent/[0.08]">
                  {step.number}
                </div>

                <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-accent/10 p-3 text-accent ring-1 ring-accent/20 transition-all duration-300 group-hover:bg-accent/15 group-hover:shadow-lg group-hover:shadow-accent/10">
                  {step.icon}
                </div>

                <h3 className="mb-3 text-xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
