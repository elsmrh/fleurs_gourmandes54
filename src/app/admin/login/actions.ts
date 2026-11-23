"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function login(prevState: string | undefined, formData: FormData) {
  const email = formData.get('email') as string
  
  if (email) {
    const { allowed, retryAfterMs } = checkRateLimit(email)
    if (!allowed) {
      const minutes = Math.ceil((retryAfterMs || 0) / 60000)
      return `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}.`
    }
  }

  try {
    await signIn("credentials", formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Identifiants invalides."
        default:
          return "Une erreur est survenue."
      }
    }
    throw error // Important to throw the redirect error
  }
}

