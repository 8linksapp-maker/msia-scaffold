/**
 * repoAtomicCommit.ts — Commit atômico via GitHub Git Tree API.
 * Um único commit agrupa N alterações de arquivo.
 * Em dev (sem GITHUB_TOKEN), faz writes individuais no filesystem.
 */
import fs from 'node:fs/promises';
import nodePath from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = nodePath.resolve(fileURLToPath(import.meta.url), '../../../');

export interface AtomicFile {
  /** Caminho relativo à raiz do repo, ex: "src/data/categories.json" */
  path: string;
  /** Conteúdo em texto (UTF-8). Null remove o arquivo. */
  content: string | null;
}

function ghEnv() {
  const token = import.meta.env.GITHUB_TOKEN;
  const owner = import.meta.env.GITHUB_OWNER;
  const repo = import.meta.env.GITHUB_REPO;
  if (!token || !owner || !repo) return null;
  return { token, owner, repo,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' } };
}

async function ghFetch(url: string, env: ReturnType<typeof ghEnv>, opts: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...opts, headers: { ...env!.headers, ...(opts.headers as any || {}) } });
}

/**
 * Commita múltiplos arquivos de uma vez (atômico).
 * Falha completamente ou tem sucesso completamente — sem estado intermediário.
 */
export async function atomicCommit(files: AtomicFile[], message: string): Promise<void> {
  if (files.length === 0) return;
  const env = ghEnv();

  // Dev mode: writes individuais no filesystem
  if (!env) {
    for (const f of files) {
      const abs = nodePath.join(PROJECT_ROOT, f.path);
      if (f.content === null) {
        await fs.rm(abs, { force: true });
      } else {
        await fs.mkdir(nodePath.dirname(abs), { recursive: true });
        await fs.writeFile(abs, f.content, 'utf-8');
      }
    }
    return;
  }

  const base = `https://api.github.com/repos/${env.owner}/${env.repo}`;

  // 1. SHA do commit HEAD de main
  const refRes = await ghFetch(`${base}/git/ref/heads/main`, env);
  if (!refRes.ok) throw new Error(`Falha ao buscar HEAD: ${refRes.status}`);
  const refData = await refRes.json();
  const headCommitSha: string = refData.object.sha;

  // 2. SHA da tree base
  const commitRes = await ghFetch(`${base}/git/commits/${headCommitSha}`, env);
  if (!commitRes.ok) throw new Error(`Falha ao buscar commit base: ${commitRes.status}`);
  const commitData = await commitRes.json();
  const baseTreeSha: string = commitData.tree.sha;

  // 3. Monta tree com todos os arquivos
  const treeItems = files.map(f => {
    if (f.content === null) {
      return { path: f.path, mode: '100644' as const, type: 'blob' as const, sha: null };
    }
    return { path: f.path, mode: '100644' as const, type: 'blob' as const, content: f.content };
  });

  const treeRes = await ghFetch(`${base}/git/trees`, env, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
  });
  if (!treeRes.ok) {
    const e = await treeRes.json().catch(() => ({}));
    throw new Error(`Falha ao criar tree: ${e.message || treeRes.status}`);
  }
  const treeData = await treeRes.json();
  const newTreeSha: string = treeData.sha;

  // 4. Cria o commit
  const newCommitRes = await ghFetch(`${base}/git/commits`, env, {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTreeSha, parents: [headCommitSha] }),
  });
  if (!newCommitRes.ok) {
    const e = await newCommitRes.json().catch(() => ({}));
    throw new Error(`Falha ao criar commit: ${e.message || newCommitRes.status}`);
  }
  const newCommitData = await newCommitRes.json();
  const newCommitSha: string = newCommitData.sha;

  // 5. Atualiza ref main
  const updateRes = await ghFetch(`${base}/git/refs/heads/main`, env, {
    method: 'PATCH',
    body: JSON.stringify({ sha: newCommitSha }),
  });
  if (!updateRes.ok) {
    const e = await updateRes.json().catch(() => ({}));
    throw new Error(`Falha ao atualizar ref: ${e.message || updateRes.status}`);
  }
}
