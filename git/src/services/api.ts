import { PortfolioProject, SiteContent, ProjectMedia } from '../types/portfolio';

const API_BASE = '/api';

function getHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['x-admin-passcode'] = token;
  }
  return headers;
}

// ----------------------------------------------------
// Public API Calls
// ----------------------------------------------------

export async function fetchPublicSiteContent(): Promise<SiteContent> {
  const res = await fetch(`${API_BASE}/site-content`);
  if (!res.ok) throw new Error('Failed to load site content');
  return res.json();
}

export async function fetchPublicProjects(category?: string): Promise<{ projects: PortfolioProject[] }> {
  const url = new URL(`${API_BASE}/projects/public`, window.location.origin);
  if (category && category !== 'All' && category !== 'all') {
    url.searchParams.set('category', category);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to load projects');
  return res.json();
}

export async function fetchPublicProjectDetail(idOrSlug: string): Promise<{ project: PortfolioProject }> {
  const res = await fetch(`${API_BASE}/projects/public/${idOrSlug}`);
  if (!res.ok) throw new Error('Project not found');
  return res.json();
}

// ----------------------------------------------------
// Admin API Calls
// ----------------------------------------------------

export async function adminLogin(passcode: string): Promise<{ success: boolean; token: string }> {
  const res = await fetch(`${API_BASE}/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Invalid passcode');
  }
  return data;
}

export async function changeAdminPasscode(newPasscode: string, token: string): Promise<{ success: boolean; token: string }> {
  const res = await fetch(`${API_BASE}/admin/change-passcode`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ newPasscode })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to change passcode');
  return data;
}

export async function fetchAdminProjects(token: string): Promise<PortfolioProject[]> {
  const res = await fetch(`${API_BASE}/admin/projects`, {
    headers: getHeaders(token)
  });
  if (!res.ok) throw new Error('Unauthorized or failed to fetch admin projects');
  const data = await res.json();
  return data.projects || [];
}

export async function fetchAdminProjectDetail(id: string, token: string): Promise<PortfolioProject> {
  const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
    headers: getHeaders(token)
  });
  if (!res.ok) throw new Error('Failed to fetch project detail');
  const data = await res.json();
  return data.project;
}

export async function createAdminProject(project: Partial<PortfolioProject>, token: string): Promise<PortfolioProject> {
  const res = await fetch(`${API_BASE}/admin/projects`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(project)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create project');
  return data.project;
}

export async function updateAdminProject(id: string, project: Partial<PortfolioProject>, token: string): Promise<PortfolioProject> {
  const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(project)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update project');
  return data.project;
}

export async function deleteAdminProject(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete project');
  }
}

export async function reorderAdminProjects(orderedIds: string[], token: string): Promise<PortfolioProject[]> {
  const res = await fetch(`${API_BASE}/admin/reorder-projects`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ orderedIds })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reorder projects');
  return data.projects;
}

export async function updateAdminSiteContent(content: Partial<SiteContent>, token: string): Promise<SiteContent> {
  const res = await fetch(`${API_BASE}/admin/site-content`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(content)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update site content');
  return data.siteContent;
}

export async function uploadMediaFile(file: File, token: string): Promise<ProjectMedia> {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|m4v)$/i.test(file.name);

  // 1. First attempt: Direct client upload to Vercel Blob via @vercel/blob/client
  // This bypasses the Vercel 4.5MB serverless limit and supports up to 500MB video uploads directly to CDN
  try {
    const { upload } = await import('@vercel/blob/client');
    const newBlob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: `${API_BASE}/blob/upload`,
      headers: {
        'x-admin-passcode': token
      }
    });

    if (newBlob && newBlob.url) {
      return {
        id: 'media-' + Date.now(),
        name: file.name,
        url: newBlob.url,
        type: isVideo ? 'video' : 'image',
        size: file.size
      };
    }
  } catch (blobErr: any) {
    // Expected in local dev when BLOB_READ_WRITE_TOKEN is not configured
    console.info('[Upload] Vercel Blob client direct upload unavailable, using server fallback:', blobErr?.message);
  }

  // 2. Fallback: Standard multipart upload to server
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'x-admin-passcode': token
    },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'File upload failed');
  return data.media;
}

export async function importBackup(jsonData: any, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/import`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(jsonData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Import failed');
}
