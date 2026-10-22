import React, { useState, useEffect } from 'react';
import {
  Lock,
  ArrowLeft,
  Film,
  FileText,
  Settings,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Download,
  Upload,
  Eye
} from 'lucide-react';
import { PortfolioProject, SiteContent, ProjectStatus } from '../../types/portfolio';
import {
  adminLogin,
  changeAdminPasscode,
  fetchAdminProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
  reorderAdminProjects,
  updateAdminSiteContent,
  importBackup
} from '../../services/api';
import { ProjectEditorModal } from './ProjectEditorModal';
import { ProjectDetailView } from '../ProjectDetailView';

interface AdminPageProps {
  isOpen: boolean;
  onClose: () => void;
  siteContent: SiteContent;
  onSiteContentUpdated: (content: SiteContent) => void;
  onProjectsUpdated: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  isOpen,
  onClose,
  siteContent,
  onSiteContentUpdated,
  onProjectsUpdated
}) => {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('portfolio_admin_token') || null;
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'content' | 'settings'>('projects');

  // Projects state
  const [adminProjects, setAdminProjects] = useState<PortfolioProject[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [previewProject, setPreviewProject] = useState<PortfolioProject | null>(null);

  // Content form state
  const [contentForm, setContentForm] = useState<SiteContent>(siteContent);

  // Notifications & passcode
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [newPasscode, setNewPasscode] = useState('');

  const loadProjects = async (token: string) => {
    try {
      const projs = await fetchAdminProjects(token);
      setAdminProjects(projs);
    } catch (err) {
      console.error('Failed to load admin projects:', err);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadProjects(adminToken);
    }
  }, [adminToken]);

  useEffect(() => {
    setContentForm(siteContent);
  }, [siteContent]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await adminLogin(passcodeInput);
      if (res.token) {
        setAdminToken(res.token);
        sessionStorage.setItem('portfolio_admin_token', res.token);
        setPasscodeInput('');
        loadProjects(res.token);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Incorrect passcode');
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    sessionStorage.removeItem('portfolio_admin_token');
  };

  const handleNewProject = () => {
    const emptyProject: PortfolioProject = {
      id: '',
      slug: '',
      title: '',
      year: new Date().getFullYear().toString(),
      category: 'Music Videos',
      status: 'draft', // Default is draft
      isFeatured: false,
      orderIndex: adminProjects.length + 1,
      shortDescription: '',
      fullDescription: '',
      role: 'Director & Editor',
      tools: ['Premiere Pro', 'DaVinci Resolve'],
      coverMediaUrl: '',
      media: [],
      updatedAt: new Date().toISOString()
    };
    setEditingProject(emptyProject);
  };

  const handleSaveProject = async (projectToSave: PortfolioProject) => {
    if (!adminToken) return;

    try {
      if (!projectToSave.id) {
        // Create
        const created = await createAdminProject(projectToSave, adminToken);
        setAdminProjects([...adminProjects, created]);
        setStatusMsg(`Created draft project "${created.title}".`);
      } else {
        // Update
        const updated = await updateAdminProject(projectToSave.id, projectToSave, adminToken);
        setAdminProjects(adminProjects.map((p) => (p.id === updated.id ? updated : p)));
        setStatusMsg(`Saved changes to "${updated.title}".`);
      }

      setEditingProject(null);
      onProjectsUpdated();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save project');
    }
  };

  const handleQuickStatusChange = async (project: PortfolioProject, newStatus: ProjectStatus) => {
    if (!adminToken) return;
    try {
      const updated = await updateAdminProject(project.id, { status: newStatus }, adminToken);
      setAdminProjects(adminProjects.map((p) => (p.id === project.id ? updated : p)));
      onProjectsUpdated();
      setStatusMsg(`"${project.title}" set to ${newStatus}.`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleToggleFeatured = async (project: PortfolioProject) => {
    if (!adminToken) return;
    try {
      const updated = await updateAdminProject(project.id, { isFeatured: !project.isFeatured }, adminToken);
      setAdminProjects(adminProjects.map((p) => (p.id === project.id ? updated : p)));
      onProjectsUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle featured');
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!adminToken) return;
    const confirmed = window.confirm(`Delete project "${title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteAdminProject(id, adminToken);
      setAdminProjects(adminProjects.filter((p) => p.id !== id));
      onProjectsUpdated();
      setStatusMsg(`Deleted "${title}".`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (!adminToken) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= adminProjects.length) return;

    const copy = [...adminProjects];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    setAdminProjects(copy);

    try {
      const orderedIds = copy.map((p) => p.id);
      await reorderAdminProjects(orderedIds, adminToken);
      onProjectsUpdated();
    } catch (err: any) {
      console.error('Reorder error:', err);
    }
  };

  const handleSaveContent = async () => {
    if (!adminToken) return;
    try {
      const updated = await updateAdminSiteContent(contentForm, adminToken);
      onSiteContentUpdated(updated);
      setStatusMsg('Site content saved and published.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save site content');
    }
  };

  const handleChangePasscodeSubmit = async () => {
    if (!adminToken || !newPasscode.trim()) return;
    try {
      const res = await changeAdminPasscode(newPasscode.trim(), adminToken);
      setAdminToken(res.token);
      sessionStorage.setItem('portfolio_admin_token', res.token);
      setNewPasscode('');
      setStatusMsg('Admin passcode updated.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to change passcode');
    }
  };

  const handleExportBackup = () => {
    const url = `/api/admin/export`;
    fetch(url, { headers: { 'x-admin-passcode': adminToken! } })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setStatusMsg('Backup downloaded.');
        setTimeout(() => setStatusMsg(null), 3000);
      });
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminToken) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await importBackup(json, adminToken);
        setStatusMsg('Database restored from backup!');
        loadProjects(adminToken);
        onProjectsUpdated();
      } catch (err: any) {
        alert('Failed to restore backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  // Render Full Project Preview View if selected
  if (previewProject) {
    return (
      <ProjectDetailView
        project={previewProject}
        onBack={() => setPreviewProject(null)}
        isPreviewMode={true}
      />
    );
  }

  const filteredList = adminProjects.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative flex h-full max-h-[92vh] w-full max-w-6xl flex-col border border-[var(--border-strong)] bg-[var(--bg-canvas)] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)] uppercase">
              Private Admin Page
            </h2>
            <span className="hidden text-xs text-[var(--text-muted)] font-mono-code md:inline">
              · Portfolio & Content Management
            </span>
          </div>

          <div className="flex items-center gap-3">
            {adminToken && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-red-400 font-mono-code transition-colors cursor-pointer mr-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 border border-[var(--border-strong)] px-3 py-1.5 text-xs font-mono-code text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Site</span>
            </button>
          </div>
        </div>

        {/* Main Body */}
        {!adminToken ? (
          // LOGIN BARRIER
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-md border border-[var(--border-strong)] bg-[var(--bg-surface)] p-8 text-center shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]">
                <Lock className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
                Administrator Login
              </h3>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Enter your administrative passcode to manage projects, upload media, and edit website content.
              </p>

              {loginError && (
                <div className="mt-4 border border-red-500/30 bg-red-950/20 p-2.5 text-xs text-red-400 font-mono-code flex items-center justify-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <input
                  type="password"
                  required
                  autoFocus
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter passcode (default: admin2026)"
                  className="w-full border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-4 py-3 text-xs text-center text-[var(--text-primary)] font-mono-code focus:border-[var(--accent)] focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full bg-[var(--accent)] py-3 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                >
                  Unlock Admin Page
                </button>
              </form>

              <div className="mt-6 border-t border-[var(--border-subtle)] pt-4 text-[11px] text-[var(--text-muted)] font-mono-code">
                Default initial passcode: <span className="text-[var(--accent)]">admin2026</span>
              </div>
            </div>
          </div>
        ) : (
          // AUTHENTICATED TABS
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Tabs Header */}
            <div className="flex items-center gap-1 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono-code uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'projects'
                    ? 'border-b-2 border-[var(--accent)] text-[var(--accent)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Film className="h-3.5 w-3.5" />
                <span>Projects ({adminProjects.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono-code uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'content'
                    ? 'border-b-2 border-[var(--accent)] text-[var(--accent)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Home, About & Contacts</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono-code uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-[var(--accent)] text-[var(--accent)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Settings & Backup</span>
              </button>
            </div>

            {/* Notification Toast */}
            {statusMsg && (
              <div className="border-b border-emerald-500/30 bg-emerald-950/20 px-6 py-2.5 text-xs text-emerald-400 font-mono-code flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              {/* TAB 1: PROJECTS */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {['all', 'published', 'draft', 'preview', 'unpublished'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setFilterStatus(st)}
                          className={`px-3 py-1.5 text-xs font-mono-code uppercase transition-colors cursor-pointer ${
                            filterStatus === st
                              ? 'bg-[var(--accent)] text-white font-bold'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {st} ({st === 'all' ? adminProjects.length : adminProjects.filter((p) => p.status === st).length})
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleNewProject}
                      className="flex items-center gap-2 bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      <span>New Project</span>
                    </button>
                  </div>

                  {/* Projects Table */}
                  <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[10px] uppercase font-mono-code text-[var(--text-muted)]">
                        <tr>
                          <th className="p-3.5">Order</th>
                          <th className="p-3.5">Project</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Media</th>
                          <th className="p-3.5">Featured</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)]">
                        {filteredList.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors">
                            {/* Order arrows */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1 font-mono-code">
                                <span className="w-5 text-[var(--text-muted)]">#{idx + 1}</span>
                                <button
                                  onClick={() => handleMoveOrder(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-20 cursor-pointer"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleMoveOrder(idx, 'down')}
                                  disabled={idx === adminProjects.length - 1}
                                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-20 cursor-pointer"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </button>
                              </div>
                            </td>

                            {/* Title & Preview thumbnail */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                {p.coverMediaUrl && (
                                  <img
                                    src={p.coverMediaUrl}
                                    alt={p.title}
                                    className="h-9 w-14 object-cover border border-[var(--border-subtle)] shrink-0"
                                  />
                                )}
                                <div>
                                  <div className="font-semibold text-[var(--text-primary)]">{p.title}</div>
                                  <div className="text-[11px] text-[var(--text-muted)] truncate max-w-xs">{p.shortDescription}</div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5 font-mono-code text-[var(--text-muted)]">
                              {p.category} · {p.year}
                            </td>

                            {/* Status Selector */}
                            <td className="p-3.5">
                              <select
                                value={p.status}
                                onChange={(e) => handleQuickStatusChange(p, e.target.value as ProjectStatus)}
                                className={`px-2 py-1 text-[11px] font-mono-code uppercase border bg-transparent cursor-pointer ${
                                  p.status === 'published'
                                    ? 'text-emerald-500 border-emerald-500/40'
                                    : p.status === 'draft'
                                    ? 'text-amber-500 border-amber-500/40'
                                    : p.status === 'preview'
                                    ? 'text-blue-500 border-blue-500/40'
                                    : 'text-gray-400 border-gray-400/40'
                                }`}
                              >
                                <option value="draft" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Draft</option>
                                <option value="preview" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Preview</option>
                                <option value="published" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Published</option>
                                <option value="unpublished" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Unpublished</option>
                              </select>
                            </td>

                            <td className="p-3.5 font-mono-code text-[var(--text-muted)]">
                              {p.media.length} files
                            </td>

                            {/* Featured toggle */}
                            <td className="p-3.5">
                              <button
                                onClick={() => handleToggleFeatured(p)}
                                className={`p-1 cursor-pointer ${p.isFeatured ? 'text-amber-400' : 'text-[var(--text-muted)]/30 hover:text-[var(--text-primary)]'}`}
                                title={p.isFeatured ? 'Featured' : 'Not Featured'}
                              >
                                <Star className={`h-4 w-4 ${p.isFeatured ? 'fill-current' : ''}`} />
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-right space-x-2">
                              <button
                                onClick={() => setPreviewProject(p)}
                                className="inline-flex items-center gap-1 border border-[var(--border-strong)] px-2 py-1 text-[11px] font-mono-code text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                                title="Live Preview"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Preview</span>
                              </button>

                              <button
                                onClick={() => setEditingProject({ ...p })}
                                className="inline-flex items-center gap-1 border border-[var(--border-strong)] px-2.5 py-1 text-[11px] font-mono-code text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                              >
                                <Edit className="h-3 w-3" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => handleDeleteProject(p.id, p.title)}
                                className="p-1 text-[var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete Project"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: SITE CONTENT */}
              {activeTab === 'content' && (
                <div className="space-y-8 max-w-4xl">
                  {/* Home intro */}
                  <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
                    <h3 className="text-xs uppercase font-mono-code tracking-wider text-[var(--accent)]">
                      1. Home Introduction & Identity
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                          Greeting
                        </label>
                        <input
                          type="text"
                          value={contentForm.home.greeting}
                          onChange={(e) => setContentForm({ ...contentForm, home: { ...contentForm.home, greeting: e.target.value } })}
                          className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                          Personal Name
                        </label>
                        <input
                          type="text"
                          value={contentForm.home.name}
                          onChange={(e) => setContentForm({ ...contentForm, home: { ...contentForm.home, name: e.target.value } })}
                          className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                          Professional Title
                        </label>
                        <input
                          type="text"
                          value={contentForm.home.title}
                          onChange={(e) => setContentForm({ ...contentForm, home: { ...contentForm.home, title: e.target.value } })}
                          className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                          Avatar / Portrait Photo URL
                        </label>
                        <input
                          type="text"
                          value={contentForm.home.avatarUrl || ''}
                          onChange={(e) => setContentForm({ ...contentForm, home: { ...contentForm.home, avatarUrl: e.target.value } })}
                          placeholder="/assets/aistudio/image_6ef505e0.png"
                          className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none font-mono-code"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                        Home Introduction Paragraph
                      </label>
                      <textarea
                        rows={3}
                        value={contentForm.home.intro}
                        onChange={(e) => setContentForm({ ...contentForm, home: { ...contentForm.home, intro: e.target.value } })}
                        className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                        Status Badge Text
                      </label>
                      <input
                        type="text"
                        value={contentForm.home.statusBadge}
                        onChange={(e) => setContentForm({ ...contentForm, home: { ...contentForm.home, statusBadge: e.target.value } })}
                        className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* About Me */}
                  <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
                    <h3 className="text-xs uppercase font-mono-code tracking-wider text-[var(--accent)]">
                      2. About Me Content
                    </h3>
                    <div>
                      <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                        Section Subheading
                      </label>
                      <input
                        type="text"
                        value={contentForm.about.title}
                        onChange={(e) => setContentForm({ ...contentForm, about: { ...contentForm.about, title: e.target.value } })}
                        className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                        Background Bio Paragraphs (separated by double newline)
                      </label>
                      <textarea
                        rows={4}
                        value={contentForm.about.bio.join('\n\n')}
                        onChange={(e) => setContentForm({ ...contentForm, about: { ...contentForm.about, bio: e.target.value.split('\n\n').filter(Boolean) } })}
                        className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                        Creative Philosophy Quote
                      </label>
                      <input
                        type="text"
                        value={contentForm.about.philosophy}
                        onChange={(e) => setContentForm({ ...contentForm, about: { ...contentForm.about, philosophy: e.target.value } })}
                        className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none italic"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                        Skills & Toolchain (one per line)
                      </label>
                      <textarea
                        rows={4}
                        value={contentForm.about.skills.join('\n')}
                        onChange={(e) => setContentForm({ ...contentForm, about: { ...contentForm.about, skills: e.target.value.split('\n').filter(Boolean) } })}
                        className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none font-mono-code"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                        Approach to Multimedia Production
                      </label>
                      <textarea
                        rows={3}
                        value={contentForm.about.approach}
                        onChange={(e) => setContentForm({ ...contentForm, about: { ...contentForm.about, approach: e.target.value } })}
                        className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Contacts */}
                  <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
                    <h3 className="text-xs uppercase font-mono-code tracking-wider text-[var(--accent)]">
                      3. Contacts & Social Platforms
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={contentForm.contacts.email}
                          onChange={(e) => setContentForm({ ...contentForm, contacts: { ...contentForm.contacts, email: e.target.value } })}
                          className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={contentForm.contacts.phone}
                          onChange={(e) => setContentForm({ ...contentForm, contacts: { ...contentForm.contacts, phone: e.target.value } })}
                          className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={contentForm.contacts.location}
                          onChange={(e) => setContentForm({ ...contentForm, contacts: { ...contentForm.contacts, location: e.target.value } })}
                          className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                          Vimeo URL
                        </label>
                        <input
                          type="url"
                          value={contentForm.contacts.socials.vimeo || ''}
                          onChange={(e) => setContentForm({ ...contentForm, contacts: { ...contentForm.contacts, socials: { ...contentForm.contacts.socials, vimeo: e.target.value } } })}
                          className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                          YouTube URL
                        </label>
                        <input
                          type="url"
                          value={contentForm.contacts.socials.youtube || ''}
                          onChange={(e) => setContentForm({ ...contentForm, contacts: { ...contentForm.contacts, socials: { ...contentForm.contacts.socials, youtube: e.target.value } } })}
                          className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                          Instagram URL
                        </label>
                        <input
                          type="url"
                          value={contentForm.contacts.socials.instagram || ''}
                          onChange={(e) => setContentForm({ ...contentForm, contacts: { ...contentForm.contacts, socials: { ...contentForm.contacts.socials, instagram: e.target.value } } })}
                          className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveContent}
                    className="bg-[var(--accent)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  >
                    Save All Site Content
                  </button>
                </div>
              )}

              {/* TAB 3: SETTINGS & BACKUP */}
              {activeTab === 'settings' && (
                <div className="space-y-8 max-w-3xl">
                  {/* Change Passcode */}
                  <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
                    <h3 className="text-xs uppercase font-mono-code tracking-wider text-[var(--accent)]">
                      Change Admin Passcode
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Update the secret passcode used to access this Admin Page.
                    </p>
                    <div className="flex gap-3 max-w-md">
                      <input
                        type="password"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        placeholder="New admin passcode..."
                        className="flex-1 border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] font-mono-code focus:border-[var(--accent)] focus:outline-none"
                      />
                      <button
                        onClick={handleChangePasscodeSubmit}
                        disabled={!newPasscode.trim()}
                        className="bg-[var(--accent)] px-4 py-2 text-xs font-mono-code uppercase text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40"
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  {/* Database Export & Import */}
                  <div className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
                    <h3 className="text-xs uppercase font-mono-code tracking-wider text-[var(--accent)]">
                      Database Backup & Restore
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Save a portable JSON backup of your projects and site copy, or restore previous data.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <button
                        onClick={handleExportBackup}
                        className="flex items-center gap-2 border border-[var(--border-strong)] px-4 py-2 text-xs font-mono-code uppercase text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Backup JSON</span>
                      </button>

                      <label className="flex items-center gap-2 border border-[var(--border-strong)] bg-transparent px-4 py-2 text-xs font-mono-code uppercase text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span>Restore from JSON</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleRestoreBackup}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Project Editor Modal */}
      {editingProject && (
        <ProjectEditorModal
          project={editingProject}
          adminToken={adminToken!}
          onSave={handleSaveProject}
          onClose={() => setEditingProject(null)}
          onPreview={(proj) => setPreviewProject(proj)}
        />
      )}
    </div>
  );
};
