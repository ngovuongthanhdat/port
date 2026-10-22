import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Video, Image as ImageIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { PortfolioProject, ProjectMedia } from '../types/portfolio';

interface ProjectDetailViewProps {
  project: PortfolioProject;
  onBack: () => void;
  isPreviewMode?: boolean;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onBack,
  isPreviewMode = false
}) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const allMedia = project.media.length > 0 ? project.media : [
    {
      id: 'default-cover',
      name: 'Cover Media',
      url: project.coverMediaUrl,
      type: project.coverMediaUrl?.endsWith('.mp4') ? ('video' as const) : ('image' as const),
      isCover: true
    }
  ];

  const currentMedia: ProjectMedia = allMedia[selectedMediaIndex] || allMedia[0];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] py-12 md:py-20 animate-in fade-in duration-200">
      {/* Admin Preview Mode Banner */}
      {isPreviewMode && (
        <div className="sticky top-16 z-30 mb-8 border-y border-amber-500/40 bg-amber-500/10 px-6 py-2.5 text-center text-xs font-mono-code text-amber-400">
          ● PREVIEW MODE — This project is currently {project.status.toUpperCase()} and not visible to public visitors until published.
        </div>
      )}

      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-6 mb-8">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-xs font-mono-code uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Projects</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono-code">
            <span className="text-[var(--accent)] font-semibold">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.year}</span>
          </div>
        </div>

        {/* Project Header */}
        <div className="max-w-3xl mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
            {project.title}
          </h1>

          {project.shortDescription && (
            <p className="mt-4 text-lg text-[var(--text-muted)] font-editorial italic leading-relaxed">
              "{project.shortDescription}"
            </p>
          )}
        </div>

        {/* Primary Media Stage (Cover / Selected Media) */}
        <div className="relative aspect-[16/9] w-full overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-elevated)] mb-8 shadow-2xl">
          {currentMedia ? (
            currentMedia.type === 'video' ? (
              <video
                key={currentMedia.url}
                src={currentMedia.url}
                controls
                playsInline
                className="h-full w-full object-contain bg-black"
              />
            ) : (
              <img
                key={currentMedia.url}
                src={currentMedia.url}
                alt={project.title}
                className="h-full w-full object-contain bg-black/40"
                referrerPolicy="no-referrer"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
              No media available
            </div>
          )}

          {/* Carousel Arrows if multiple items */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={() => setSelectedMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded bg-black/60 p-2 text-white/80 hover:bg-[var(--accent)] hover:text-white transition-colors cursor-pointer"
                aria-label="Previous media"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSelectedMediaIndex((prev) => (prev + 1) % allMedia.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded bg-black/60 p-2 text-white/80 hover:bg-[var(--accent)] hover:text-white transition-colors cursor-pointer"
                aria-label="Next media"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 right-3 rounded bg-black/70 px-2.5 py-1 text-[11px] font-mono-code text-white">
                {selectedMediaIndex + 1} / {allMedia.length}
              </div>
            </>
          )}
        </div>

        {/* Additional Media Thumbnails Strip */}
        {allMedia.length > 1 && (
          <div className="mb-12 flex gap-3 overflow-x-auto pb-2">
            {allMedia.map((mediaItem, index) => (
              <button
                key={mediaItem.id || index}
                onClick={() => setSelectedMediaIndex(index)}
                className={`relative aspect-[16/10] w-28 shrink-0 overflow-hidden border transition-all cursor-pointer ${
                  selectedMediaIndex === index
                    ? 'border-[var(--accent)] scale-102 shadow-md'
                    : 'border-[var(--border-subtle)] opacity-70 hover:opacity-100'
                }`}
              >
                {mediaItem.type === 'video' ? (
                  <div className="flex h-full w-full items-center justify-center bg-black/80 text-white">
                    <Video className="h-4 w-4 text-[var(--accent)]" />
                  </div>
                ) : (
                  <img
                    src={mediaItem.url}
                    alt={mediaItem.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Detailed Breakdown Content */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 border-t border-[var(--border-subtle)] pt-10">
          {/* Left Column: Full Description */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <h3 className="text-xs font-mono-code uppercase tracking-wider text-[var(--accent)] mb-3">
                Project Overview & Narrative
              </h3>
              <div className="space-y-4 text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line font-normal">
                {project.fullDescription || project.shortDescription}
              </div>
            </div>

            {/* External Project Link */}
            {project.externalLink && (
              <div className="pt-4">
                <a
                  href={project.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-[var(--border-strong)] bg-[var(--bg-surface)] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <span>Open External Project</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Roles, Tools & Tech Specs */}
          <div className="lg:col-span-4 space-y-8 lg:border-l lg:border-[var(--border-subtle)] lg:pl-10">
            {project.role && (
              <div>
                <h4 className="text-xs uppercase font-mono-code tracking-wider text-[var(--accent)] mb-2">
                  My Role & Responsibilities
                </h4>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {project.role}
                </p>
              </div>
            )}

            {project.tools && project.tools.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-mono-code tracking-wider text-[var(--accent)] mb-2">
                  Software, Tools & Techniques
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-mono-code text-[var(--text-muted)]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs uppercase font-mono-code tracking-wider text-[var(--accent)] mb-2">
                Production Classification
              </h4>
              <p className="text-xs font-mono-code text-[var(--text-muted)]">
                {project.category} · {project.year}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
