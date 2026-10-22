import path from 'path';
import fs from 'fs';
import os from 'os';
import { put, list } from '@vercel/blob';
import { initialProjects, initialSiteContent } from '../src/data/initialData';
import { PortfolioProject, SiteContent } from '../src/types/portfolio';

export interface DatabaseStore {
  adminPasscodeHash: string;
  siteContent: SiteContent;
  projects: PortfolioProject[];
}

const isVercel = Boolean(process.env.VERCEL);
const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_STORE_FILE = path.join(LOCAL_DATA_DIR, 'portfolio-store.json');
const TMP_STORE_FILE = path.join(os.tmpdir(), 'portfolio-store.json');
const BLOB_STORE_PATH = 'cms/portfolio-store.json';

// Initialize in-memory cache
let db: DatabaseStore = {
  adminPasscodeHash: 'admin2026',
  siteContent: initialSiteContent,
  projects: initialProjects
};

let isInitialized = false;

export function initDatabaseSync(): DatabaseStore {
  if (isInitialized) return db;

  // 1. Try reading local file (works in local dev and if baked into deployment)
  try {
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const raw = fs.readFileSync(LOCAL_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseStore;
      if (parsed.projects && parsed.siteContent) {
        db = parsed;
        isInitialized = true;
        return db;
      }
    }
  } catch (err) {
    console.warn('[DB] Could not read local store file, checking fallback:', err);
  }

  // 2. Try reading /tmp file (for serverless warm container)
  try {
    if (fs.existsSync(TMP_STORE_FILE)) {
      const raw = fs.readFileSync(TMP_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseStore;
      if (parsed.projects && parsed.siteContent) {
        db = parsed;
        isInitialized = true;
        return db;
      }
    }
  } catch (err) {
    console.warn('[DB] Could not read tmp store file:', err);
  }

  // 3. Fallback to code defaults
  db = {
    adminPasscodeHash: 'admin2026',
    siteContent: initialSiteContent,
    projects: initialProjects
  };

  // Ensure local directory exists in dev
  if (!isVercel) {
    try {
      if (!fs.existsSync(LOCAL_DATA_DIR)) fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch (_) {}
  }

  isInitialized = true;
  return db;
}

// Asynchronously sync from Vercel Blob if configured
export async function syncFromVercelBlob(): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;

  try {
    const blobList = await list({ prefix: BLOB_STORE_PATH });
    const existingBlob = blobList.blobs.find((b) => b.pathname === BLOB_STORE_PATH) || blobList.blobs[0];

    if (existingBlob) {
      const res = await fetch(existingBlob.url);
      if (res.ok) {
        const remoteData = (await res.json()) as DatabaseStore;
        if (remoteData.projects && remoteData.siteContent) {
          db = remoteData;
          return true;
        }
      }
    }
  } catch (err) {
    console.warn('[DB] Failed to sync from Vercel Blob:', err);
  }
  return false;
}

// Save database changes both locally and to Vercel Blob
export async function saveDatabase(newDb?: DatabaseStore): Promise<void> {
  if (newDb) {
    db = newDb;
  }

  // 1. If Vercel Blob token is available, persist to Vercel Blob for persistent serverless cloud storage!
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put(BLOB_STORE_PATH, JSON.stringify(db, null, 2), {
        access: 'public',
        addRandomSuffix: false
      });
      console.log('[DB] Successfully synced CMS database to Vercel Blob.');
    } catch (blobErr) {
      console.error('[DB] Failed to sync to Vercel Blob:', blobErr);
    }
  }

  // 2. Attempt local file save
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    // If running in read-only environment (e.g. Vercel Lambda), write to /tmp
    try {
      fs.writeFileSync(TMP_STORE_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch (_) {}
  }
}

export function getDatabase(): DatabaseStore {
  if (!isInitialized) {
    initDatabaseSync();
  }
  return db;
}
