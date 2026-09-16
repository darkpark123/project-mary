import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";
import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { encryptBuffer, decryptBuffer } from "@/lib/crypto";

// ponytail: file bytes are AES-256-GCM encrypted (src/lib/crypto.ts) before
// they ever reach storage, so an unguessable-but-technically-public Vercel
// Blob URL (the base tier's model) still isn't readable without
// ENCRYPTION_KEY. Without BLOB_READ_WRITE_TOKEN configured (no Vercel Blob
// store linked yet), files land encrypted on local disk instead - fine for
// dev, NOT for a real multi-instance production deploy.
const LOCAL_DIR = path.join(process.cwd(), ".uploads");

export async function storeDocument(
  buffer: Buffer,
  originalFilename: string
): Promise<{ storageBackend: "blob" | "local"; storageKey: string }> {
  const encrypted = encryptBuffer(buffer);
  const key = `${randomUUID()}-${originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, encrypted, { access: "public", contentType: "application/octet-stream" });
    return { storageBackend: "blob", storageKey: blob.url };
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  const filePath = path.join(LOCAL_DIR, key);
  await writeFile(filePath, encrypted);
  return { storageBackend: "local", storageKey: filePath };
}

export async function retrieveDocument(storageBackend: string, storageKey: string): Promise<Buffer> {
  if (storageBackend === "blob") {
    const res = await fetch(storageKey);
    if (!res.ok) throw new Error(`Failed to fetch document: ${res.status}`);
    const encrypted = Buffer.from(await res.arrayBuffer());
    return decryptBuffer(encrypted);
  }

  const encrypted = await readFile(storageKey);
  return decryptBuffer(encrypted);
}

export async function deleteDocument(storageBackend: string, storageKey: string): Promise<void> {
  if (storageBackend === "blob") {
    await del(storageKey);
  } else {
    await unlink(storageKey).catch(() => {});
  }
}
