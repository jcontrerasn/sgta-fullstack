"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useAuthStore } from "@/frontend/stores/auth.store";

type Tarea = {
  IdTarea: number;
  Titulo: string;
  Descripcion: string;
  FechaVencimiento: string;
  UsuarioCreador: string;
};

type TareasResponse = {
  success?: boolean;
  data?: Tarea[];
  message?: string;
};

function normalizeRole(value: string) {
  return value
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

export function TareasCreadasCard() {
  const usuario = useAuthStore((state) => state.usuario);
  const rol = useAuthStore((state) => state.rol);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const normalizedRole = normalizeRole(rol);
  const canCreateTask = !["usuario", "tecnico_soporte"].includes(normalizedRole);

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

        const currentUser = usuario.toLocaleLowerCase();
        setTareas(
          (result.data ?? []).filter(
            (tarea) =>
              tarea.UsuarioCreador.trim().toLocaleLowerCase() === currentUser,
          ),
        );
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
  }, [isInitialized, usuario]);

  return (
    <>
      <Box className="tareas-created-card">
        <Box className="tareas-created-card__header">
          <Box className="tareas-created-card__title-group">
            <Box className="tareas-created-card__icon">
              <TaskAltOutlinedIcon />
            </Box>
            <Box>
              <Box className="tareas-created-card__title-content">
                <Box className="tareas-created-card__title-row">
                  <Typography component="h2">Mis tareas creadas</Typography>
                  <Typography component="span" className="tareas-created-card__count">
                    {isLoading
                      ? "..."
                      : `${tareas.length} ${tareas.length === 1 ? "tarea" : "tareas"}`}
                  </Typography>
                </Box>
                <Typography component="p">
                  Consulta y administra las tareas que registraste.
                </Typography>
              </Box>
            </Box>
          </Box>
          {canCreateTask ? (
            <Button
              component={Link}
              href="/tareas/nueva"
              variant="contained"
              startIcon={<AddRoundedIcon />}
              className="tareas-created-card__new-button"
            >
              Nueva tarea
            </Button>
          ) : null}
        </Box>

        {isLoading ? (
          <Box className="tareas-created-card__empty">Cargando tareas...</Box>
        ) : error ? (
          <Box className="tareas-created-card__empty tareas-created-card__empty--error">
            {error}
          </Box>
        ) : tareas.length === 0 ? (
          <Box className="tareas-created-card__empty">
            Todavía no has creado ninguna tarea.
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
                  {tarea.UsuarioCreador.trim().toLocaleLowerCase() ===
                  usuario.trim().toLocaleLowerCase() ? (
                    <Button
                      component={Link}
                      href={`/tareas/${tarea.IdTarea}/editar`}
                      type="button"
                      className="task-summary-card__action"
                    >
                      Modificar
                    </Button>
                  ) : null}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Dialog
        open={Boolean(selectedTarea)}
        onClose={() => setSelectedTarea(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Detalle de la tarea</DialogTitle>
        <DialogContent dividers>
          <Box className="tarea-detail-dialog">
            <Typography component="span" className="tarea-detail-dialog__label">
              Título
            </Typography>
            <Typography component="p">{selectedTarea?.Titulo}</Typography>
            <Typography component="span" className="tarea-detail-dialog__label">
              Descripción
            </Typography>
            <Typography component="p">
              {selectedTarea?.Descripcion || "Sin descripción"}
            </Typography>
            <Typography component="span" className="tarea-detail-dialog__label">
              Fecha de vencimiento
            </Typography>
            <Typography component="p">
              {selectedTarea ? formatDate(selectedTarea.FechaVencimiento) : ""}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTarea(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
