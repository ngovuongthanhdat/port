import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import multer from 'multer';
import { put } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getDatabase, saveDatabase, syncFromVercelBlob, DatabaseStore } from './db';
import { PortfolioProject, SiteContent, ProjectStatus } from '../src/types/portfolio';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set up local uploads directory for development
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!process.env.VERCEL) {
  try {
    if (!fs.existsSync(LOCAL_UPLOADS_DIR)) fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
  } catch (_) {}
  app.use('/uploads', express.static(LOCAL_UPLOADS_DIR));
}

// Multer storage for local development & fallback uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dest = process.env.VERCEL ? os.tmpdir() : LOCAL_UPLOADS_DIR;
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeBase}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }
});

// Admin Auth Middleware
const ADMIN_SECRET_HEADER = 'x-admin-passcode';
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers[ADMIN_SECRET_HEADER] as string;
  const db = getDatabase();
  if (!token || token !== db.adminPasscodeHash) {
    res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });
    return;
  }
  next();
}

// Background sync from Vercel Blob if running on Vercel
syncFromVercelBlob().catch(() => {});

// Router for all API routes
const apiRouter = express.Router();

// ----------------------------------------------------
// Health & Environment Diagnostic
// ----------------------------------------------------
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'local-node',
    hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    timestamp: new Date().toISOString()
  });
});

// ----------------------------------------------------
// PUBLIC API ROUTES
// ----------------------------------------------------

// 1. Get Public Site Content (Home, About, Contacts)
apiRouter.get('/site-content', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.siteContent);
});

// 2. Get Public Projects (ONLY published projects, sorted by orderIndex)
apiRouter.get('/projects/public', (req: Request, res: Response) => {
  const db = getDatabase();
  const category = req.query.category as string | undefined;

  let published = db.projects
    .filter((p) => p.status === 'published')
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  if (category && category !== 'All' && category !== 'all') {
    published = published.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  res.json({ projects: published });
});

// 3. Get Public Single Project Detail
apiRouter.get('/projects/public/:idOrSlug', (req: Request, res: Response) => {
  const db = getDatabase();
  const { idOrSlug } = req.params;
  const project = db.projects.find(
    (p) => (p.id === idOrSlug || p.slug === idOrSlug) && p.status === 'published'
  );

  if (!project) {
    res.status(404).json({ error: 'Project not found or not published' });
    return;
  }

  res.json({ project });
});

// ----------------------------------------------------
// ADMIN API ROUTES
// ----------------------------------------------------

// Admin Login
apiRouter.post('/admin/auth', (req: Request, res: Response) => {
  const db = getDatabase();
  const { passcode } = req.body;
  if (!passcode) {
    res.status(400).json({ error: 'Passcode is required' });
    return;
  }

  if (passcode === db.adminPasscodeHash) {
    res.json({ success: true, token: db.adminPasscodeHash });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect passcode' });
  }
});

// Change Admin Passcode
apiRouter.post('/admin/change-passcode', requireAdminAuth, async (req: Request, res: Response) => {
  const db = getDatabase();
  const { newPasscode } = req.body;
  if (!newPasscode || newPasscode.trim().length < 4) {
    res.status(400).json({ error: 'Passcode must be at least 4 characters' });
    return;
  }
  db.adminPasscodeHash = newPasscode.trim();
  await saveDatabase();
  res.json({ success: true, token: db.adminPasscodeHash });
});

// Get All Projects (Admin: draft, preview, published, unpublished)
apiRouter.get('/admin/projects', requireAdminAuth, (_req: Request, res: Response) => {
  const db = getDatabase();
  const sorted = [...db.projects].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  res.json({ projects: sorted });
});

// Get Any Project by ID (Admin)
apiRouter.get('/admin/projects/:id', requireAdminAuth, (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const project = db.projects.find((p) => p.id === id || p.slug === id);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json({ project });
});

// Create Project
apiRouter.post('/admin/projects', requireAdminAuth, async (req: Request, res: Response) => {
  const db = getDatabase();
  const incoming = req.body as Partial<PortfolioProject>;
  const id = 'proj-' + Date.now();
  const slug = incoming.slug || (incoming.title ? incoming.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : id);

  const newProject: PortfolioProject = {
    id,
    slug,
    title: incoming.title || 'Untitled Project',
    year: incoming.year || new Date().getFullYear().toString(),
    category: incoming.category || 'General',
    status: (incoming.status as ProjectStatus) || 'draft',
    isFeatured: Boolean(incoming.isFeatured),
    orderIndex: incoming.orderIndex ?? db.projects.length + 1,
    shortDescription: incoming.shortDescription || '',
    fullDescription: incoming.fullDescription || '',
    role: incoming.role || 'Multimedia Producer',
    tools: incoming.tools || ['Premiere Pro', 'DaVinci Resolve'],
    externalLink: incoming.externalLink || '',
    coverMediaUrl: incoming.coverMediaUrl || '',
    media: incoming.media || [],
    updatedAt: new Date().toISOString()
  };

  db.projects.push(newProject);
  await saveDatabase();
  res.status(201).json({ success: true, project: newProject });
});

// Update Project
apiRouter.put('/admin/projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const incoming = req.body as Partial<PortfolioProject>;

  const index = db.projects.findIndex((p) => p.id === id);
  if (index < 0) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  db.projects[index] = {
    ...db.projects[index],
    ...incoming,
    id,
    updatedAt: new Date().toISOString()
  };

  await saveDatabase();
  res.json({ success: true, project: db.projects[index] });
});

// Delete Project
apiRouter.delete('/admin/projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const initialCount = db.projects.length;
  db.projects = db.projects.filter((p) => p.id !== id);

  if (db.projects.length < initialCount) {
    await saveDatabase();
    res.json({ success: true, message: 'Project removed' });
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

// Reorder Projects
apiRouter.post('/admin/reorder-projects', requireAdminAuth, async (req: Request, res: Response) => {
  const db = getDatabase();
  const { orderedIds } = req.body as { orderedIds: string[] };
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ error: 'orderedIds must be an array' });
    return;
  }

  orderedIds.forEach((id, index) => {
    const project = db.projects.find((p) => p.id === id);
    if (project) {
      project.orderIndex = index + 1;
    }
  });

  await saveDatabase();
  res.json({ success: true, projects: db.projects });
});

// Update Site Content (Home, About, Contacts)
apiRouter.post('/admin/site-content', requireAdminAuth, async (req: Request, res: Response) => {
  const db = getDatabase();
  const incoming = req.body as Partial<SiteContent>;
  db.siteContent = {
    ...db.siteContent,
    home: { ...db.siteContent.home, ...(incoming.home || {}) },
    about: { ...db.siteContent.about, ...(incoming.about || {}) },
    contacts: { ...db.siteContent.contacts, ...(incoming.contacts || {}) }
  };

  await saveDatabase();
  res.json({ success: true, siteContent: db.siteContent });
});

// Export Database JSON Backup
apiRouter.get('/admin/export', requireAdminAuth, (_req: Request, res: Response) => {
  const db = getDatabase();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="portfolio-cms-backup.json"');
  res.send(JSON.stringify(db, null, 2));
});

// Import Database JSON Backup
apiRouter.post('/admin/import', requireAdminAuth, async (req: Request, res: Response) => {
  const incoming = req.body as Partial<DatabaseStore>;
  if (!incoming.siteContent || !Array.isArray(incoming.projects)) {
    res.status(400).json({ error: 'Invalid backup structure' });
    return;
  }

  const db = getDatabase();
  db.siteContent = incoming.siteContent;
  db.projects = incoming.projects;
  if (incoming.adminPasscodeHash) db.adminPasscodeHash = incoming.adminPasscodeHash;

  await saveDatabase();
  res.json({ success: true, message: 'Database successfully restored from backup' });
});

// ----------------------------------------------------
// VERCEL BLOB DIRECT CLIENT UPLOADS (Supports >500MB without 4.5MB serverless limit)
// ----------------------------------------------------
apiRouter.post('/blob/upload', async (req: Request, res: Response) => {
  const token = req.headers[ADMIN_SECRET_HEADER] as string;
  const db = getDatabase();
  if (!token || token !== db.adminPasscodeHash) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(400).json({
      error: 'Vercel Blob token is not configured. Falling back to local upload.'
    });
    return;
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            'video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/avi'
          ],
          maximumSizeInBytes: 500 * 1024 * 1024 // Up to 500MB for multimedia files
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('[Blob] Upload completed directly to CDN:', blob.url);
      }
    });

    res.json(jsonResponse);
  } catch (err: any) {
    console.error('[Blob] handleUpload error:', err);
    res.status(400).json({ error: err.message || 'Blob token generation failed' });
  }
});

// Direct Media Upload Endpoint (Local Fallback & Vercel Blob Put)
apiRouter.post('/upload', requireAdminAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { originalname, mimetype, size, filename, path: localFilePath } = req.file;
    const isVideo = mimetype.startsWith('video/') || originalname.match(/\.(mp4|mov|webm|mkv|m4v)$/i) !== null;
    let fileUrl = `/uploads/${filename}`;

    // If Vercel Blob token is configured, upload to Vercel Blob for persistent CDN delivery
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const fileBuffer = fs.readFileSync(localFilePath);
        const blob = await put(originalname, fileBuffer, {
          access: 'public',
          contentType: mimetype
        });
        fileUrl = blob.url;
      } catch (blobError) {
        console.warn('[Upload] Vercel Blob put failed, keeping local URL:', blobError);
      }
    }

    res.json({
      success: true,
      media: {
        id: 'media-' + Date.now(),
        name: originalname,
        url: fileUrl,
        type: isVideo ? 'video' : 'image',
        size
      }
    });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

// Mount the router on BOTH '/api' and '/' so Vercel rewrites work identically in all cases!
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
