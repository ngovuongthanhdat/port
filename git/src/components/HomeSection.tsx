import React from 'react';
import { ArrowDown, ArrowUpRight, GraduationCap, Globe2, Sparkles } from 'lucide-react';
import { SiteContent } from '../types/portfolio';

interface HomeSectionProps {
  siteContent: SiteContent;
  onExploreProjects: () => void;
  onNavigateToContact: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  siteContent,
  onExploreProjects,
  onNavigateToContact
}) => {
  const { home, about } = siteContent;

  return (
    <section id="home" className="relative border-b border-[var(--border-subtle)] py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="max-w-3xl space-y-6">
            {/* Status Badge Line */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--accent)] font-mono-code">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span>{home.statusBadge}</span>
            </div>

            {/* Name & Title */}
            <div>
              <p className="text-sm uppercase font-mono-code text-[var(--text-muted)] tracking-wider">
                {home.greeting}
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[var(--text-primary)] leading-[1.08] mt-1">
                {home.name}
              </h1>
              <p
                className="mt-2 text-2xl font-semibold text-[var(--accent)] tracking-tight sm:text-3xl"
                style={{ fontFamily: 'Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                {home.title}
              </p>
            </div>

            {/* Tagline & Intro */}
            <p className="text-base sm:text-lg text-[var(--text-primary)] font-medium leading-relaxed max-w-2xl">
              {home.tagline}
            </p>

            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl">
              {home.intro}
            </p>

            {/* Education & Language Quick Chips */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono-code text-[var(--text-muted)]">
              {about.education && (
                <div className="flex items-center gap-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>{about.education.institution} ({about.education.period})</span>
                </div>
              )}
              {about.languages && about.languages.length > 0 && (
                <div className="flex items-center gap-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5">
                  <Globe2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>EN: IELTS 6.5 · VN: Native</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreProjects}
                className="flex items-center gap-2 bg-[var(--accent)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-98 cursor-pointer shadow-sm"
              >
                <span>View Projects</span>
                <ArrowDown className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={onNavigateToContact}
                className="flex items-center gap-2 border border-[var(--border-strong)] bg-transparent px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors active:scale-98 cursor-pointer"
              >
                <span>Get in Touch</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
          </div>
        </div>
      </div>
    </section>
  );
};
