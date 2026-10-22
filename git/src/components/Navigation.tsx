import React, { useState } from 'react';
import { Sun, Moon, Lock, Menu, X, SlidersHorizontal } from 'lucide-react';
import { SiteContent } from '../types/portfolio';

interface NavigationProps {
  siteContent: SiteContent;
  isLightMode: boolean;
  onToggleTheme: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  siteContent,
  isLightMode,
  onToggleTheme,
  onOpenAdmin,
  isAdminLoggedIn,
  currentRoute,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', target: 'home' },
    { label: 'Projects', target: 'projects' },
    { label: 'About Me', target: 'about' },
    { label: 'Contacts', target: 'contacts' }
  ];

  const handleNavClick = (target: string) => {
    setMobileMenuOpen(false);
    onNavigate(target);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6 lg:px-10">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-lg font-bold tracking-tight text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors whitespace-nowrap shrink-0 cursor-pointer text-left"
        >
          {siteContent.home.name}
        </button>

        {/* Zone 2: 4 Single-line Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-[var(--text-muted)] font-mono-code">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => handleNavClick(item.target)}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentRoute === item.target ? 'text-[var(--accent)] font-bold' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions (Theme Toggle & Admin Access) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded hover:bg-[var(--border-subtle)] cursor-pointer"
            title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle visual theme"
          >
            {isLightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Admin Access Button */}
          <button
            onClick={onOpenAdmin}
            className={`p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors rounded hover:bg-[var(--border-subtle)] cursor-pointer ${
              isAdminLoggedIn ? 'text-[var(--accent)]' : ''
            }`}
            title={isAdminLoggedIn ? 'Admin CMS (Authenticated)' : 'Admin Portal'}
            aria-label="Admin Portal"
          >
            {isAdminLoggedIn ? <SlidersHorizontal className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-4 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-3 text-xs uppercase tracking-widest font-mono-code text-[var(--text-muted)]">
            {navItems.map((item) => (
              <button
                key={item.target}
                onClick={() => handleNavClick(item.target)}
                className={`text-left py-1 hover:text-[var(--text-primary)] transition-colors ${
                  currentRoute === item.target ? 'text-[var(--accent)] font-bold' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
