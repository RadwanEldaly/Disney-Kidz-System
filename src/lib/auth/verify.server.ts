import { getRequest } from "@tanstack/react-start/server";
import { gateIdentityEnabled } from "./gate-identity.server";
import { auth, authConfigured } from "./server";

export { authConfigured };

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

/** Auth off → always staff user. Keep deploy URL private. */
export async function requireUserId(bearerToken?: string): Promise<string> {
  if (authIsOff()) {
    return DEV_USER_ID;
  }
  const user = await getSessionUser(bearerToken);
  if (!user) throw new UnauthorizedError();
  return user.id;
}
