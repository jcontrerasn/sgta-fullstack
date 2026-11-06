"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { AppHeader } from "./app-header";
import { AppTopNav } from "./app-top-nav";
import { useAuthStore } from "@/frontend/stores/auth.store";
import { LoginView } from "@/frontend/modules/auth/components/login-view";

type AuthProfile = {
  Usuario: string;
  NombreCompleto: string;
  Area: string;
  Rol: string | null;
};

function capitalizeNamePart(value: string) {
  const normalizedValue = value.toLocaleLowerCase("es-ES");

  return (
    normalizedValue.charAt(0).toLocaleUpperCase("es-ES") +
    normalizedValue.slice(1)
  );
}

function getFirstNameAndSurname(fullName: string) {
  const normalizedName = fullName.trim();

  if (!normalizedName) {
    return "Usuario";
  }

  if (normalizedName.includes(",")) {
    const [surnames, names] = normalizedName
      .split(",", 2)
      .map((part) => part.trim());
    const firstName = names?.split(/\s+/)[0];
    const firstSurname = surnames?.split(/\s+/)[0];

    return (
      [firstName, firstSurname]
        .filter(Boolean)
        .map((part) => capitalizeNamePart(part as string))
        .join(" ") || "Usuario"
    );
  }

  return normalizedName
    .split(/\s+/)
    .slice(0, 2)
    .map(capitalizeNamePart)
    .join(" ");
}

async function loadAuthProfile(usuario: string): Promise<AuthProfile> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario }),
  });

  const result: {
    success?: boolean;
    data?: AuthProfile;
    message?: string;
  } = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "No se pudo encontrar el usuario.");
  }

  return result.data;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const usuario = useAuthStore((state) => state.usuario);
  const nombreCompleto = useAuthStore((state) => state.nombreCompleto);
  const authArea = useAuthStore((state) => state.area);
  const authRole = useAuthStore((state) => state.rol);
  const isAuthInitialized = useAuthStore((state) => state.isInitialized);
  const setAuthSession = useAuthStore((state) => state.setAuthSession);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let cancelled = false;

    async function initializeAuth() {
      try {
        await useAuthStore.persist.rehydrate();

        const persistedUsuario = useAuthStore.getState().usuario;

        if (persistedUsuario) {
          const profile = await loadAuthProfile(persistedUsuario);

          if (!cancelled) {
            setAuthSession({
              usuario: profile.Usuario,
              nombreCompleto: profile.NombreCompleto,
              area: profile.Area,
              rol: profile.Rol ?? "",
            });
          }
        }
      } catch (error: unknown) {
        if (!cancelled) {
          console.error(
            "No se pudo cargar el perfil del usuario:",
            error instanceof Error ? error.message : "Error desconocido",
          );
        }
      } finally {
        if (!cancelled) {
          setInitialized(true);
        }
      }
    }

    void initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [setAuthSession, setInitialized]);

  async function handleLogin(loginUsuario: string) {
    const profile = await loadAuthProfile(loginUsuario);

    setAuthSession({
      usuario: profile.Usuario,
      nombreCompleto: profile.NombreCompleto,
      area: profile.Area,
      rol: profile.Rol ?? "",
    });
  }

  if (!isAuthInitialized) {
    return <Box className="login-page login-page--loading" />;
  }

  if (!usuario) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <Box className={`app-shell${darkMode ? " app-shell--dark" : ""}`}>
      <Box className="app-shell__content">
        <AppHeader
          userName={
            nombreCompleto
              ? getFirstNameAndSurname(nombreCompleto)
              : "Cargando..."
          }
          area={authArea || "Cargando..."}
          role={authRole || "Usuario"}
          onOpenNav={() => setMobileNavOpen(true)}
        />
        <AppTopNav
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
          darkMode={darkMode}
          onToggleDarkMode={() =>
            setDarkMode((enabled) => {
              const nextMode = !enabled;
              window.localStorage.setItem("sgta-dark-mode", String(nextMode));
              return nextMode;
            })
          }
        />
        <Box component="main" className="app-shell__main">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
