const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;

export function checkRateLimit(ip: string, max: number): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}
