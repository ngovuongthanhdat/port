import React from 'react';
import { Lock } from 'lucide-react';
import { SiteContent } from '../types/portfolio';

interface FooterProps {
  siteContent: SiteContent;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ siteContent, onOpenAdmin }) => {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-10 text-[var(--text-muted)] text-xs font-mono-code transition-colors">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-10">
        <div>
          © {new Date().getFullYear()} {siteContent.home.name}. All rights reserved.
        </div>

        <div className="flex items-center gap-6">
          <a href="#home" className="hover:text-[var(--text-primary)] transition-colors">
            Home
          </a>
          <a href="#projects" className="hover:text-[var(--text-primary)] transition-colors">
            Projects
          </a>
          <a href="#about" className="hover:text-[var(--text-primary)] transition-colors">
            About Me
          </a>
          <a href="#contacts" className="hover:text-[var(--text-primary)] transition-colors">
            Contacts
          </a>
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <Lock className="h-3 w-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
