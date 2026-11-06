"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { Box, Button, Chip, Typography } from "@mui/material";
import { useAuthStore } from "@/frontend/stores/auth.store";

type Tarea = {
  IdTarea: number;
  Titulo: string;
  Descripcion: string;
  FechaVencimiento: string;
  UsuarioCreador: string;
  Involucrados: string[];
};

type TareasResponse = {
  success?: boolean;
  data?: Tarea[];
  message?: string;
};

type UserProfile = {
  Usuario: string;
  Area: string;
  Rol: string | null;
};

type UserProfileResponse = {
  success?: boolean;
  data?: UserProfile;
};

function normalizeRole(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_")
    .toLocaleLowerCase();
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function TareasAsignadasCard() {
  const usuario = useAuthStore((state) => state.usuario);
  const area = useAuthStore((state) => state.area);
  const rol = useAuthStore((state) => state.rol);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [otrasTareas, setOtrasTareas] = useState<Tarea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isInitialized || !usuario) {
      return;
    }

    const controller = new AbortController();

    async function loadTareas() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/tareas", {
          signal: controller.signal,
        });
        const result: TareasResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "No se pudieron cargar las tareas.");
        }

        const currentUser = usuario.trim().toLocaleLowerCase();
        const allTareas = result.data ?? [];
        setTareas(
          allTareas.filter((tarea) =>
            tarea.Involucrados.some(
              (involucrado) =>
                involucrado.trim().toLocaleLowerCase() === currentUser,
            ),
          ),
        );

        if (normalizeRole(rol) === "tecnico_soporte" && area.trim()) {
          const creatorAccounts = Array.from(
            new Set(allTareas.map((tarea) => tarea.UsuarioCreador)),
          );
          const creatorProfiles = await Promise.all(
            creatorAccounts.map(async (account) => {
              try {
                const profileResponse = await fetch("/api/auth/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ usuario: account }),
                  signal: controller.signal,
                });
                const profileResult: UserProfileResponse =
                  await profileResponse.json();

                return profileResponse.ok && profileResult.success && profileResult.data
                  ? profileResult.data
                  : null;
              } catch (profileError) {
                if (!(profileError instanceof DOMException && profileError.name === "AbortError")) {
                  return null;
                }

                return null;
              }
            }),
          );
          const profilesByAccount = new Map(
            creatorProfiles
              .filter((profile): profile is UserProfile => profile !== null)
              .map((profile) => [profile.Usuario.toLocaleLowerCase(), profile]),
          );
          const currentArea = area.trim().toLocaleLowerCase();

          setOtrasTareas(
            allTareas.filter((tarea) => {
              const creator = profilesByAccount.get(
                tarea.UsuarioCreador.trim().toLocaleLowerCase(),
              );
              const isInvolved = tarea.Involucrados.some(
                (involucrado) =>
                  involucrado.trim().toLocaleLowerCase() === currentUser,
              );

              return (
                !isInvolved &&
                normalizeRole(creator?.Rol) === "responsable_hw_sw" &&
                creator?.Area.trim().toLocaleLowerCase() === currentArea
              );
            }),
          );
        } else {
          setOtrasTareas([]);
        }
        setError("");
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar las tareas.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTareas();

    return () => controller.abort();
  }, [area, isInitialized, rol, usuario]);

  const canSeeOtherAreaTasks = normalizeRole(rol) === "tecnico_soporte";

  return (
    <>
      <Box className="tareas-created-card tareas-assigned-card">
      <Box className="tareas-created-card__header">
        <Box className="tareas-created-card__title-group">
          <Box className="tareas-created-card__icon">
            <GroupOutlinedIcon />
          </Box>
          <Box className="tareas-created-card__title-content">
            <Box className="tareas-created-card__title-row">
              <Typography component="h2">Mis tareas asignadas</Typography>
              <Typography component="span" className="tareas-created-card__count">
                {isLoading
                  ? "..."
                  : `${tareas.length} ${tareas.length === 1 ? "tarea" : "tareas"}`}
              </Typography>
            </Box>
            <Typography component="p">
              Consulta las tareas en las que estás involucrado.
            </Typography>
          </Box>
        </Box>
      </Box>

      {isLoading ? (
        <Box className="tareas-created-card__empty">Cargando tareas...</Box>
      ) : error ? (
        <Box className="tareas-created-card__empty tareas-created-card__empty--error">
          {error}
        </Box>
      ) : tareas.length === 0 ? (
        <Box className="tareas-created-card__empty">
          No tienes tareas asignadas.
        </Box>
      ) : (
        <Box className="tareas-created-card__list">
          {tareas.map((tarea) => (
            <Box className="task-summary-card" key={tarea.IdTarea}>
              <Box className="task-summary-card__heading">
                <Typography component="h3">{tarea.Titulo}</Typography>
                <Chip label="Activa" size="small" className="task-summary-card__status" />
              </Box>
              <Typography component="p" className="task-summary-card__description">
                {tarea.Descripcion || "Sin detalle registrado."}
              </Typography>
              <Box className="task-summary-card__due-date">
                <CalendarTodayOutlinedIcon />
                <Typography component="span">
                  Vence: {formatDate(tarea.FechaVencimiento)}
                </Typography>
              </Box>
              <Box className="task-summary-card__actions">
                <Button
                  component={Link}
                  href={`/tareas/${tarea.IdTarea}`}
                  type="button"
                  className="task-summary-card__action"
                >
                  Ver detalle
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
      </Box>

      {canSeeOtherAreaTasks ? (
        <Box className="tareas-created-card tareas-other-area-card">
          <Box className="tareas-created-card__header">
            <Box className="tareas-created-card__title-group">
              <Box className="tareas-created-card__icon">
                <GroupOutlinedIcon />
              </Box>
              <Box className="tareas-created-card__title-content">
                <Box className="tareas-created-card__title-row">
                  <Typography component="h2">Otras tareas de mi área</Typography>
                  <Typography component="span" className="tareas-created-card__count">
                    {isLoading
                      ? "..."
                      : `${otrasTareas.length} ${otrasTareas.length === 1 ? "tarea" : "tareas"}`}
                  </Typography>
                </Box>
                <Typography component="p">
                  Tareas de responsables de tu misma área.
                </Typography>
              </Box>
            </Box>
          </Box>

          {isLoading ? (
            <Box className="tareas-created-card__empty">Cargando tareas...</Box>
          ) : error ? (
            <Box className="tareas-created-card__empty tareas-created-card__empty--error">
              {error}
            </Box>
          ) : otrasTareas.length === 0 ? (
            <Box className="tareas-created-card__empty">
              No hay otras tareas de tu área.
            </Box>
          ) : (
            <Box className="tareas-created-card__list">
              {otrasTareas.map((tarea) => (
                <Box className="task-summary-card" key={tarea.IdTarea}>
                  <Box className="task-summary-card__heading">
                    <Typography component="h3">{tarea.Titulo}</Typography>
                    <Chip label="Activa" size="small" className="task-summary-card__status" />
                  </Box>
                  <Typography component="p" className="task-summary-card__description">
                    {tarea.Descripcion || "Sin detalle registrado."}
                  </Typography>
                  <Box className="task-summary-card__due-date">
                    <CalendarTodayOutlinedIcon />
                    <Typography component="span">
                      Vence: {formatDate(tarea.FechaVencimiento)}
                    </Typography>
                  </Box>
                  <Box className="task-summary-card__actions">
                    <Button
                      component={Link}
                      href={`/tareas/${tarea.IdTarea}`}
                      type="button"
                      className="task-summary-card__action"
                    >
                      Ver detalle
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ) : null}
    </>
  );
}
