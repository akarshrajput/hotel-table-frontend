import { create } from "zustand";

interface User {
  id: string;
  name?: string;
  email: string;
  role: "superadmin" | "owner";
  restaurantId?: string;
  slug?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    set({ token: null, user: null, isAuthenticated: false });
  },

  setUser: (user) => {
    set({ user });
  },

  hydrate: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Decode token to get user info
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const decoded = JSON.parse(jsonPayload);

          // Check expiry
          if (decoded.exp * 1000 > Date.now()) {
            set({
              token,
              user: {
                id: decoded.id,
                role: decoded.role,
                restaurantId: decoded.restaurantId,
                slug: decoded.slug,
                email: decoded.email || "",
              },
              isAuthenticated: true,
            });
          } else {
            localStorage.removeItem("token");
          }
        } catch {
          localStorage.removeItem("token");
        }
      }
    }
  },
}));
