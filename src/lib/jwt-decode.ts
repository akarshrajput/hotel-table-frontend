/**
 * Minimal JWT decode (no verification — that's done server-side).
 * Decodes the payload portion of a JWT string.
 */
export function jwtDecode<T = Record<string, unknown>>(token: string): T {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    throw new Error("Invalid token");
  }
}
