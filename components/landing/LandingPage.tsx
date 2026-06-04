"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection, HeroPreviewSection } from "@/components/layout/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyRecon } from "@/components/landing/WhyRecon";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
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
        submitted={submitted}
      />
      <HeroPreviewSection movies={heroPreviewMovies} />
      <HowItWorks />
      <WhyRecon />
      <FAQ />
      <Footer />
    </div>
  );
}
