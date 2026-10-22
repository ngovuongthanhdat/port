import React, { useState } from 'react';
import { ArrowUpRight, Video, Image as ImageIcon } from 'lucide-react';
import { PortfolioProject } from '../types/portfolio';

interface ProjectGridProps {
  projects: PortfolioProject[];
  onSelectProject: (project: PortfolioProject) => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onSelectProject }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))];

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="projects" className="relative border-b border-[var(--border-subtle)] py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        {/* Section Header & Category Filters */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-[var(--border-subtle)] pb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-mono-code mb-1">
              Works
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Featured Projects
            </h2>
          </div>

          {/* Clean Segmented Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-mono-code uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[var(--accent)] text-white font-bold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-[var(--text-muted)]">No published projects found in this category.</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const hasVideo = project.media.some((m) => m.type === 'video');

              return (
                <article
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="group relative flex flex-col justify-between overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all duration-300 hover:border-[var(--accent)] hover:shadow-xl cursor-pointer"
                >
                  {/* Cover Media Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg-elevated)]">
                    {project.coverMediaUrl ? (
                      <img
                        src={project.coverMediaUrl}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-6 text-center text-[var(--text-muted)]">
                        {hasVideo ? <Video className="h-8 w-8 opacity-40" /> : <ImageIcon className="h-8 w-8 opacity-40" />}
                      </div>
                    )}

                    {/* Subtle video indicator */}
                    {hasVideo && (
                      <div className="absolute top-3 right-3 rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono-code text-white backdrop-blur-sm flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        <span>VIDEO</span>
                      </div>
                    )}
                  </div>

                  {/* Card Metadata (Zero-Pill Discipline) */}
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Unboxed Metadata Line */}
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono-code mb-1.5">
                        <span className="text-[var(--accent)] font-semibold">{project.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.year}</span>
                      </div>

                      {/* Project Title */}
                      <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)] flex items-center justify-between">
                        <span>{project.title}</span>
                        <ArrowUpRight className="h-4 w-4 opacity-0 -translate-x-1 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 text-[var(--accent)]" />
                      </h3>

                      {/* Short Description */}
                      {project.shortDescription && (
                        <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                          {project.shortDescription}
                        </p>
                      )}
                    </div>

                    {/* Role Footer */}
                    {project.role && (
                      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] font-mono-code truncate">
                        Role: {project.role}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
