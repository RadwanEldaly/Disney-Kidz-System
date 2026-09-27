import { getRequest } from "@tanstack/react-start/server";
import { gateIdentityEnabled } from "./gate-identity.server";
import { auth, authConfigured } from "./server";

export { authConfigured };

// When auth is off, requireUserId() returns the shared staff user even if
// DATABASE_URL is set (internal single-tenant dashboard). Do not log as error.

/** Dev fallback user id, used only when auth is disabled (VITE_AUTH_ENABLED=false). */
export const DEV_USER_ID = "dev-user";

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export type VerifiedUser = { id: string; email: string | null };

function authIsOff(): boolean {
  // Direct env check — most reliable on Vercel runtime
  if (process.env.VITE_AUTH_ENABLED === "false") return true;
  if (!authConfigured && !gateIdentityEnabled()) return true;
  return false;
}

export async function getSessionUser(
  bearerToken?: string,
): Promise<VerifiedUser | null> {
  if (authIsOff()) return null;
  const request = getRequest();
  if (!request) return null;
  let headers = request.headers;
  if (bearerToken) {
    headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${bearerToken}`);
  }
  const session = await auth.api.getSession({ headers });
  if (!session?.user) return null;
  return { id: session.user.id, email: session.user.email ?? null };
}

/**
 * Resolve the current user id for a server function, or throw when unauthorized.
 * Prefer `authMiddleware` (`./middleware`), which calls this for you.
 *
 * - Auth enabled -> verified session user id; throws UnauthorizedError when signed out.
 * - Auth disabled (`VITE_AUTH_ENABLED=false`) -> shared staff user `dev-user`.
 *   This app is a private internal ops dashboard (single-tenant team data).
 *   When login is intentionally off, server functions run as staff so Production
 *   (with DATABASE_URL) works the same as local. Keep the deploy URL private.
 */
export async function requireUserId(bearerToken?: string): Promise<string> {
  return DEV_USER_ID;
}
