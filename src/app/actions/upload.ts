"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";

export async function uploadImageAction(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  
  if (!file) {
    throw new Error("Aucun fichier n'a été fourni.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // S'assurer que le dossier public/uploads existe
  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Le dossier existe déjà probablement
  }

  // Générer un nom de fichier unique pour éviter les conflits
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const filepath = join(uploadDir, filename);

  // Sauvegarder le fichier
  await writeFile(filepath, buffer);

  // Retourner l'URL publique de l'image
  return `/uploads/${filename}`;
}

