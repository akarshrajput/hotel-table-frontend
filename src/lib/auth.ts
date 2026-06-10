import { jwtDecode } from "./jwt-decode";

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export interface DecodedToken {
  id: string;
  role: "superadmin" | "owner";
  restaurantId?: string;
  slug?: string;
  exp: number;
  iat: number;
}

export function decodeToken(): DecodedToken | null {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function isTokenValid(): boolean {
  const decoded = decodeToken();
  if (!decoded) return false;
  return decoded.exp * 1000 > Date.now();
}
