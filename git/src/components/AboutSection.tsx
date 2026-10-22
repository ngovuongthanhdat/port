import React from 'react';
import { Briefcase, GraduationCap, Globe, Wrench, Sparkles, CheckCircle2 } from 'lucide-react';
import { SiteContent } from '../types/portfolio';

interface AboutSectionProps {
  siteContent: SiteContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ siteContent }) => {
  const { about } = siteContent;

  return (
    <section id="about" className="relative border-b border-[var(--border-subtle)] py-20 lg:py-28 font-sans">
      <div className="mx-auto max-w-6xl px-6 lg:px-10 space-y-16">
        {/* Section Title */}
        <div>
          <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-mono-code mb-1">
            Background
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl font-sans">
            About Me & Working Experience
          </h2>
        </div>

        {/* Top Grid: Bio, Education & Languages */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Bio Narrative */}
          <div className="lg:col-span-7 space-y-5">
            <h3 className="text-xs uppercase font-mono-code tracking-wider text-[var(--accent)]">
              Profile Summary
            </h3>
            <div className="space-y-4 text-base text-[var(--text-primary)] leading-relaxed font-sans">
              {about.bio.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {about.philosophy && (
              <div className="border-l-2 border-[var(--accent)] pl-4 py-1.5 mt-6">
                <p className="font-sans text-base sm:text-lg font-medium text-[var(--text-primary)] leading-relaxed">
                  "{about.philosophy}"
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Education & Languages Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Education */}
            {about.education && (
              <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-2">
                <div className="flex items-center gap-2 text-xs uppercase font-mono-code text-[var(--accent)]">
                  <GraduationCap className="h-4 w-4" />
                  <span>Education</span>
                </div>
                <div className="text-base font-bold text-[var(--text-primary)] font-sans">
                  {about.education.degree}
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono-code">
                  {about.education.institution} ({about.education.period})
                </div>
              </div>
            )}

            {/* Languages */}
            {about.languages && about.languages.length > 0 && (
              <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs uppercase font-mono-code text-[var(--accent)]">
                  <Globe className="h-4 w-4" />
                  <span>Languages</span>
                </div>
                <div className="space-y-2">
                  {about.languages.map((lang, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text-primary)] font-sans">{lang.language}</span>
                      <span className="font-mono-code text-[var(--text-muted)]">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Working Experience Timeline */}
        {about.experiences && about.experiences.length > 0 && (
          <div className="border-t border-[var(--border-subtle)] pt-14 space-y-8">
            <div className="flex items-center gap-2 text-xs uppercase font-mono-code tracking-wider text-[var(--accent)]">
              <Briefcase className="h-4 w-4" />
              <span>Working Experience</span>
            </div>

            <div className="space-y-8">
              {about.experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 transition-colors hover:border-[var(--accent)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-[var(--border-subtle)] pb-4 mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-[var(--text-primary)] font-sans">
                        {exp.role}
                      </h4>
                      <p className="text-xs font-mono-code text-[var(--accent)] font-semibold mt-0.5">
                        {exp.organization}
                      </p>
                    </div>
                    <span className="text-xs font-mono-code text-[var(--text-muted)]">
                      {exp.period}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {exp.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-sans">
                        <CheckCircle2 className="h-4 w-4 text-[var(--accent)] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Tools Section */}
        <div className="border-t border-[var(--border-subtle)] pt-14 grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Skills List */}
          <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-4">
            <h3 className="text-xs font-mono-code uppercase tracking-wider text-[var(--accent)] flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Core Skills</span>
            </h3>
            <ul className="space-y-2.5">
              {about.skills.map((skill, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-primary)] font-mono-code">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Software & Tools */}
          {about.tools && about.tools.length > 0 && (
            <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 space-y-4">
              <h3 className="text-xs font-mono-code uppercase tracking-wider text-[var(--accent)] flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span>Software & Tools</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {about.tools.map((tool, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3 text-xs font-mono-code text-[var(--text-primary)] font-medium"
                  >
                    <span className="h-2 w-2 rounded-sm bg-[var(--accent)]" />
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
