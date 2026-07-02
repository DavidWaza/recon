"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection, HeroPreviewSection } from "@/components/layout/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyRecon } from "@/components/landing/WhyRecon";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { PreferenceQuiz } from "@/components/landing/PreferenceQuiz";
import { AdBanner } from "@/components/ads/AdBanner";
import { ADSENSE_SLOTS } from "@/lib/adsense";
import type { Movie } from "@/lib/types";

type LandingPageProps = {
  heroCarouselMovies?: Movie[];
  heroPreviewMovies?: Movie[];
};

export function LandingPage({
  heroCarouselMovies = [],
  heroPreviewMovies = [],
}: LandingPageProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [quizSubscriberId, setQuizSubscriberId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection
        previewMovies={heroCarouselMovies}
        email={email}
        onEmailChange={setEmail}
        onSubmit={handleSubmit}
        onSubscribed={setQuizSubscriberId}
        submitted={submitted}
      />
      <HeroPreviewSection movies={heroPreviewMovies} />

      {/* Best mid-page placement: users just browsed picks; high intent before scrolling on. */}
      <AdBanner slot={ADSENSE_SLOTS.homeMid} className="py-10" />

      <HowItWorks />
      <WhyRecon />

      {/* Lower-funnel placement: readers who reached FAQ are engaged. */}
      <AdBanner slot={ADSENSE_SLOTS.homeFooter} className="pb-6 pt-2" />

      <FAQ />
      <Footer />

      <AnimatePresence>
        {quizSubscriberId && (
          <PreferenceQuiz
            subscriberId={quizSubscriberId}
            onClose={() => setQuizSubscriberId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
