import { create } from "zustand";

type AuthState = {
    token: string | null;
    setToken: (t: string | null) => void;
    logout: () => void;
};

export const authStore = create<AuthState>((set) => ({
    token: localStorage.getItem("admin_token"),
    setToken: (t) => {
        if (t) localStorage.setItem("admin_token", t);
        else localStorage.removeItem("admin_token");
        set({ token: t });
    },
    logout: () => {
        localStorage.removeItem("admin_token");
        set({ token: null });
    },
}));
