import { NextRequest, NextResponse } from "next/server"
import { readFile, stat } from "fs/promises"
import { join, normalize, extname } from "path"

/**
 * Sert les images uploadées depuis l'admin.
 * En production (build standalone), les fichiers ajoutés à public/ après le build
 * ne sont pas servis : on les stocke donc dans UPLOAD_DIR (volume Docker).
 */
const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads")

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const relative = normalize(path.join("/")).replace(/^(\.\.(\/|\\|$))+/, "")
  const ext = extname(relative).toLowerCase()

  // Uniquement des images, et pas de sortie du dossier d'uploads
  if (!MIME_TYPES[ext] || relative.includes("..")) {
    return new NextResponse("Not found", { status: 404 })
  }

  const filePath = join(UPLOAD_DIR, relative)
  try {
    const info = await stat(filePath)
    if (!info.isFile()) throw new Error("not a file")
    const data = await readFile(filePath)
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME_TYPES[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
