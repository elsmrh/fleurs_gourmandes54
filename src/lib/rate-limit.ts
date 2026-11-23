// In-memory rate limiter with configurable window and max attempts per key
const attempts = new Map<string, { count: number; resetAt: number }>()

const DEFAULT_MAX_ATTEMPTS = 5
const DEFAULT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export function checkRateLimit(
  key: string,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
  windowMs: number = DEFAULT_WINDOW_MS
): { allowed: boolean; remainingAttempts: number; retryAfterMs?: number } {
  const now = Date.now()
  const entry = attempts.get(key)

  // Clean up expired entries
  if (entry && now > entry.resetAt) {
    attempts.delete(key)
  }

  const current = attempts.get(key)

  if (!current) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remainingAttempts: Math.max(0, maxAttempts - 1) }
  }

  if (current.count >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterMs: current.resetAt - now,
    }
  }

  current.count++
  return { allowed: true, remainingAttempts: Math.max(0, maxAttempts - current.count) }
}

export function resetRateLimit(key: string) {
  attempts.delete(key)
}

export function getClientIp(headersList: Headers): string {
  const forwardedFor = headersList.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  return headersList.get("x-real-ip") || "unknown-ip"
}
