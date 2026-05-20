"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection, HeroPreviewSection } from "@/components/layout/HeroSection";
import { heroCarouselMovies, heroPreviewMovies } from "@/lib/data/movies";

export function LandingPage() {
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
      <footer className="border-t border-border py-10 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} Recon · Curated for movie lovers</p>
      </footer>
    </div>
  );
}
