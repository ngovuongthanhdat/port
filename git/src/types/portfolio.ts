export type ProjectStatus = 'draft' | 'preview' | 'published' | 'unpublished';

export interface ProjectMedia {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size?: number;
  isCover?: boolean;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  year: string;
  category: string;
  status: ProjectStatus;
  isFeatured: boolean;
  orderIndex: number;
  shortDescription: string;
  fullDescription: string;
  role: string;
  tools: string[];
  externalLink?: string;
  coverMediaUrl: string;
  media: ProjectMedia[];
  updatedAt: string;
}

export interface ExperienceItem {
  role: string;
  organization: string;
  period: string;
  highlights: string[];
}

export interface LanguageItem {
  language: string;
  level: string;
}

export interface SiteContent {
  home: {
    greeting: string;
    name: string;
    title: string;
    tagline: string;
    intro: string;
    statusBadge: string;
    avatarUrl?: string;
  };
  about: {
    title: string;
    bio: string[];
    philosophy?: string;
    skills: string[];
    tools?: string[];
    approach?: string;
    education?: {
      degree: string;
      institution: string;
      period: string;
    };
    experiences?: ExperienceItem[];
    languages?: LanguageItem[];
  };
  contacts: {
    email: string;
    phone: string;
    location: string;
    socials: {
      vimeo?: string;
      youtube?: string;
      instagram?: string;
      linkedin?: string;
      github?: string;
      behance?: string;
    };
  };
}
