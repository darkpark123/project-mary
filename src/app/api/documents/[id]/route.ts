import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { retrieveDocument } from "@/lib/storage";

// Files are never linked publicly - every download goes through this route,
// which checks the requester owns the document before decrypting anything.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const doc = await db.document.findUnique({ where: { id }, include: { profile: true } });
  if (!doc || doc.profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await retrieveDocument(doc.storageBackend, doc.storageKey);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `attachment; filename="${doc.originalFilename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
