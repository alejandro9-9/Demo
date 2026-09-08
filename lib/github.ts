import type { SiteContent } from './content';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type GithubConfig = { token: string; owner: string; repo: string; branch: string };

function config(): GithubConfig {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) throw new Error('GitHub Contents API no está configurada. Revisa GITHUB_TOKEN, GITHUB_OWNER y GITHUB_REPO.');
  return { token, owner, repo, branch: process.env.GITHUB_BRANCH || 'main' };
}

function hasGithubConfig() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO);
}

function endpoint(settings: GithubConfig, path: string) {
  return `https://api.github.com/repos/${encodeURIComponent(settings.owner)}/${encodeURIComponent(settings.repo)}/contents/${path}`;
}

async function githubRequest(url: string, init: RequestInit) {
  const response = await fetch(url, { ...init, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${config().token}`, 'X-GitHub-Api-Version': '2022-11-28', ...init.headers } });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub API respondió ${response.status}: ${detail.slice(0, 240)}`);
  }
  return response;
}

export async function saveContentToGithub(content: SiteContent) {
  if (!hasGithubConfig()) {
    if (process.env.NODE_ENV === 'production') throw new Error('GitHub Contents API no está configurada.');
    const localContentPath = process.env.LOCAL_CONTENT_PATH || path.join(process.cwd(), 'data', 'content.json');
    await mkdir(path.dirname(localContentPath), { recursive: true });
    await writeFile(localContentPath, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
    return { local: true, commit: {} };
  }
  const settings = config();
  const url = `${endpoint(settings, 'data/content.json')}?ref=${encodeURIComponent(settings.branch)}`;
  const currentResponse = await githubRequest(url, { method: 'GET' });
  const current = await currentResponse.json() as { sha: string };
  const body = { message: 'Admin: actualización de contenido web', content: Buffer.from(`${JSON.stringify(content, null, 2)}\n`).toString('base64'), sha: current.sha, branch: settings.branch };
  const updated = await githubRequest(endpoint(settings, 'data/content.json'), { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  return { ...await updated.json() as { commit?: { html_url?: string }; content?: { sha?: string } }, local: false };
}

export async function uploadImageToGithub(file: File) {
  const extension = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension || 'bin'}`;
  const repoPath = `public/uploads/${safeName}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!hasGithubConfig()) {
    if (process.env.NODE_ENV === 'production') throw new Error('GitHub Contents API no está configurada.');
    const localDirectory = process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');
    await mkdir(localDirectory, { recursive: true });
    await writeFile(path.join(localDirectory, safeName), bytes);
    return `/uploads/${safeName}`;
  }
  const settings = config();
  const body = { message: `Admin: subir imagen ${safeName}`, content: bytes.toString('base64'), branch: settings.branch };
  await githubRequest(endpoint(settings, repoPath), { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  // GitHub stores the file under `public/`, but Next.js exposes that folder
  // from the site root, so the browser URL must omit the `public` prefix.
  return `/uploads/${safeName}`;
}
