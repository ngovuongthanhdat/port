import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { HomeSection } from './components/HomeSection';
import { ProjectGrid } from './components/ProjectGrid';
import { ProjectDetailView } from './components/ProjectDetailView';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminPage } from './components/admin/AdminPage';
import { SiteContent, PortfolioProject } from './types/portfolio';
import { initialSiteContent, initialProjects } from './data/initialData';
import { fetchPublicSiteContent, fetchPublicProjects, fetchPublicProjectDetail } from './services/api';

export default function App() {
  const [siteContent, setSiteContent] = useState<SiteContent>(initialSiteContent);
  const [publishedProjects, setPublishedProjects] = useState<PortfolioProject[]>(
    initialProjects.filter((p) => p.status === 'published')
  );
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Theme Management (Default dark, toggleable to light)
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('portfolio_theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
      localStorage.setItem('portfolio_theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('portfolio_theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode((prev) => !prev);
  };

  // Load public data from backend
  const loadPublicData = useCallback(async () => {
    try {
      const [contentData, projectsData] = await Promise.all([
        fetchPublicSiteContent(),
        fetchPublicProjects()
      ]);
      setSiteContent(contentData);
      setPublishedProjects(projectsData.projects);
    } catch (err) {
      console.warn('Backend load note, using local fallback:', err);
    }
  }, []);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  // Check admin session
  useEffect(() => {
    setIsAdminLoggedIn(Boolean(sessionStorage.getItem('portfolio_admin_token')));
  }, [isAdminOpen]);

  // URL Hash Routing: #/projects/:id or #/admin or ?admin
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash;
      const search = window.location.search;

      if (hash.includes('admin') || search.includes('admin')) {
        setIsAdminOpen(true);
        return;
      }

      const match = hash.match(/#\/projects\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const projectId = match[1];
        // Try to find in published projects or fetch
        const existing = publishedProjects.find((p) => p.id === projectId || p.slug === projectId);
        if (existing) {
          setSelectedProject(existing);
        } else {
          try {
            const res = await fetchPublicProjectDetail(projectId);
            if (res.project) setSelectedProject(res.project);
          } catch (err) {
            console.error('Failed to load project from URL:', err);
          }
        }
      } else {
        setSelectedProject(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [publishedProjects]);

  const handleSelectProject = (project: PortfolioProject) => {
    window.location.hash = `#/projects/${project.id}`;
    setSelectedProject(project);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGallery = () => {
    window.location.hash = '';
    setSelectedProject(null);
    setTimeout(() => {
      const el = document.getElementById('projects');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleNavigateSection = (target: string) => {
    if (selectedProject) {
      window.location.hash = '';
      setSelectedProject(null);
    }
    setCurrentRoute(target);
    setTimeout(() => {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans antialiased selection:bg-[var(--accent)] selection:text-white transition-colors">
      {/* Navigation Top Bar */}
      <Navigation
        siteContent={siteContent}
        isLightMode={isLightMode}
        onToggleTheme={toggleTheme}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        currentRoute={currentRoute}
        onNavigate={handleNavigateSection}
      />

      {/* Main View Router: Dedicated Project Detail vs 4 Main Sections */}
      {selectedProject ? (
        <ProjectDetailView
          project={selectedProject}
          onBack={handleBackToGallery}
        />
      ) : (
        <main>
          {/* Section 1: Home */}
          <HomeSection
            siteContent={siteContent}
            onExploreProjects={() => handleNavigateSection('projects')}
            onNavigateToContact={() => handleNavigateSection('contacts')}
          />

          {/* Section 2: Projects Gallery */}
          <ProjectGrid
            projects={publishedProjects}
            onSelectProject={handleSelectProject}
          />

          {/* Section 3: About Me */}
          <AboutSection siteContent={siteContent} />

          {/* Section 4: Contacts */}
          <ContactSection siteContent={siteContent} />
        </main>
      )}

      {/* Minimal Footer */}
      <Footer
        siteContent={siteContent}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Private Admin Page */}
      <AdminPage
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          if (window.location.hash.includes('admin') || window.location.search.includes('admin')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }}
        siteContent={siteContent}
        onSiteContentUpdated={(updated) => setSiteContent(updated)}
        onProjectsUpdated={() => loadPublicData()}
      />
    </div>
  );
}
