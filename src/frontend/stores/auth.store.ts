"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

type AuthState = {
  usuario: string;
  nombreCompleto: string;
  area: string;
  rol: string;
  isInitialized: boolean;
  setAuthSession: (session: {
    usuario: string;
    nombreCompleto: string;
    area: string;
    rol: string;
  }) => void;
  setInitialized: (value: boolean) => void;
};

const tabSessionStorage: StateStorage = {
  getItem: (name) =>
    typeof window === "undefined" ? null : window.sessionStorage.getItem(name),
  setItem: (name, value) => window.sessionStorage.setItem(name, value),
  removeItem: (name) => window.sessionStorage.removeItem(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: "",
      nombreCompleto: "",
      area: "",
      rol: "",
      isInitialized: false,
      setAuthSession: ({ usuario, nombreCompleto, area, rol }) =>
        set({ usuario, nombreCompleto, area, rol, isInitialized: true }),
      setInitialized: (isInitialized) => set({ isInitialized }),
    }),
    {
      name: "sgta-auth",
      storage: createJSONStorage(() => tabSessionStorage),
      skipHydration: true,
      partialize: (state) => ({
        usuario: state.usuario,
        nombreCompleto: state.nombreCompleto,
        area: state.area,
        rol: state.rol,
      }),
    },
  ),
);
