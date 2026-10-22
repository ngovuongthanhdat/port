import React, { useState } from 'react';
import { X, Upload, Trash2, Eye, Star, Video, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { PortfolioProject, ProjectMedia, ProjectStatus } from '../../types/portfolio';
import { uploadMediaFile } from '../../services/api';

interface ProjectEditorModalProps {
  project: PortfolioProject;
  adminToken: string;
  onSave: (project: PortfolioProject) => Promise<void>;
  onClose: () => void;
  onPreview: (project: PortfolioProject) => void;
}

export const ProjectEditorModal: React.FC<ProjectEditorModalProps> = ({
  project,
  adminToken,
  onSave,
  onClose,
  onPreview
}) => {
  const [formData, setFormData] = useState<PortfolioProject>({ ...project });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedMediaList: ProjectMedia[] = [...formData.media];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const media = await uploadMediaFile(file, adminToken);
        uploadedMediaList.push(media);
      }

      // If no cover media exists, make first image the cover
      let cover = formData.coverMediaUrl;
      if (!cover && uploadedMediaList.length > 0) {
        cover = uploadedMediaList[0].url;
      }

      setFormData({
        ...formData,
        media: uploadedMediaList,
        coverMediaUrl: cover
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    const updatedMedia = formData.media.filter((m) => m.id !== mediaId);
    let cover = formData.coverMediaUrl;
    if (cover === formData.media.find((m) => m.id === mediaId)?.url) {
      cover = updatedMedia.length > 0 ? updatedMedia[0].url : '';
    }
    setFormData({
      ...formData,
      media: updatedMedia,
      coverMediaUrl: cover
    });
  };

  const handleSetCover = (url: string) => {
    setFormData({
      ...formData,
      coverMediaUrl: url
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative my-auto w-full max-w-4xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {formData.id.startsWith('proj-') && !formData.title ? 'Create New Project' : `Edit: ${formData.title || 'Untitled'}`}
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-mono-code mt-0.5">
              Status: <span className="uppercase text-[var(--accent)] font-semibold">{formData.status}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPreview(formData)}
              className="flex items-center gap-1.5 border border-[var(--border-strong)] px-3 py-1.5 text-xs font-mono-code text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mb-6 border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-400 font-mono-code flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Main Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                Production Year *
              </label>
              <input
                type="text"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Music Videos, Documentary"
                className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                Publishing Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
              >
                <option value="draft">Draft (Private to Admin)</option>
                <option value="preview">Preview (Admin Review)</option>
                <option value="published">Published (Visible to Public)</option>
                <option value="unpublished">Unpublished (Archived from Public)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="h-4 w-4 accent-[var(--accent)] cursor-pointer"
              />
              <label htmlFor="isFeatured" className="text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
                Mark as Featured
              </label>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
              Short Description (Card synopsis, 1-2 sentences)
            </label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Brief summary for gallery cards..."
              className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
              Full Project Description * (Detailed case study narrative)
            </label>
            <textarea
              rows={5}
              required
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              placeholder="In-depth explanation of the project context, brief, challenges, creative decisions..."
              className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Role and Tools */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                My Role & Responsibilities
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Lead Cinematographer, Editor, Colorist"
                className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
                Tools, Software & Techniques (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tools.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tools: e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                  })
                }
                placeholder="Sony FX3, Premiere Pro, DaVinci Resolve, ACES"
                className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono-code text-[var(--text-muted)] mb-1">
              External Project Link (Optional YouTube, Vimeo, Behance URL)
            </label>
            <input
              type="url"
              value={formData.externalLink || ''}
              onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
              placeholder="https://vimeo.com/..."
              className="w-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Direct File Upload & Media Manager */}
          <div className="border-t border-[var(--border-subtle)] pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono-code uppercase tracking-wider text-[var(--accent)]">
                  Media Files & Cover ({formData.media.length})
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Upload images and videos directly from your computer. Select one file to serve as the project cover.
                </p>
              </div>

              {/* Upload Button */}
              <label className={`flex items-center gap-2 bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90 transition-opacity cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className={`h-3.5 w-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                <span>{isUploading ? 'Uploading...' : 'Upload Media'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Media Items List */}
            {formData.media.length === 0 ? (
              <div className="border border-dashed border-[var(--border-strong)] p-8 text-center text-[var(--text-muted)] bg-[var(--bg-canvas)]">
                <Upload className="mx-auto h-8 w-8 opacity-40 mb-2" />
                <p className="text-xs">No media files uploaded yet.</p>
                <p className="text-[10px] mt-1">Upload JPEG, PNG, WEBP stills or MP4, MOV, WEBM video files.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {formData.media.map((item) => {
                  const isCover = formData.coverMediaUrl === item.url;
                  return (
                    <div
                      key={item.id}
                      className={`group relative aspect-[16/10] overflow-hidden border bg-black transition-all ${
                        isCover ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]' : 'border-[var(--border-subtle)]'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <div className="flex h-full w-full items-center justify-center bg-black/80 text-white">
                          <Video className="h-6 w-6 text-[var(--accent)]" />
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      )}

                      {/* Cover Badge */}
                      {isCover && (
                        <div className="absolute top-1.5 left-1.5 bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-mono-code uppercase font-bold text-white">
                          Cover
                        </div>
                      )}

                      {/* Action Overlays */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="text-[9px] font-mono-code text-white truncate">
                          {item.name}
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => handleSetCover(item.url)}
                              className="text-[9px] font-mono-code bg-white/20 text-white px-2 py-1 hover:bg-[var(--accent)] transition-colors cursor-pointer"
                            >
                              Set Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(item.id)}
                            className="text-red-400 hover:text-red-300 p-1 ml-auto cursor-pointer"
                            title="Delete file"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-6">
            <button
              type="button"
              onClick={onClose}
              className="border border-[var(--border-strong)] px-5 py-2.5 text-xs font-mono-code text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-[var(--accent)] px-7 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
