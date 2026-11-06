"use client";

import { useEffect, useMemo, useState } from "react";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Alert, Box, Button, Chip, TextField, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { toast } from "sonner";
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

type UserProfileResponse = {
  success?: boolean;
  data?: {
    Usuario: string;
    NombreCompleto: string;
  };
};

type Anotacion = {
  IdAnotacion: number;
  IdTarea: number;
  UsuarioAutor: string;
  Comentario: string;
  EsComentarioCierre: boolean;
  FechaCreacion: string;
};

type CreateAnotacionResponse = {
  success?: boolean;
  data?: Anotacion;
  message?: string;
};

type ListAnotacionesResponse = {
  success?: boolean;
  data?: Anotacion[];
  message?: string;
};

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

export function TareaDetalleView() {
  const params = useParams<{ id: string }>();
  const usuario = useAuthStore((state) => state.usuario);
  const nombreCompleto = useAuthStore((state) => state.nombreCompleto);
  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [anotacion, setAnotacion] = useState("");
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [anotaciones, setAnotaciones] = useState<Anotacion[]>([]);
  const [isSavingAnnotation, setIsSavingAnnotation] = useState(false);
  const tareaId = useMemo(() => Number(params.id), [params.id]);
  const hasInvalidTareaId = !Number.isInteger(tareaId) || tareaId < 1;

  useEffect(() => {
    if (hasInvalidTareaId) {
      return;
    }

    const controller = new AbortController();

    async function loadTarea() {
      try {
        const response = await fetch("/api/tareas", { signal: controller.signal });
        const result: TareasResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "No se pudo cargar la tarea.");
        }

        const currentTarea = (result.data ?? []).find(
          (item) => item.IdTarea === tareaId,
        );

        if (!currentTarea) {
          throw new Error("No se encontró la tarea solicitada.");
        }

        setTarea(currentTarea);

        const annotationsResponse = await fetch(
          `/api/tareas/${currentTarea.IdTarea}/anotaciones`,
          { signal: controller.signal },
        );
        const annotationsResult: ListAnotacionesResponse =
          await annotationsResponse.json();
        const loadedAnnotations =
          annotationsResponse.ok && annotationsResult.success
            ? annotationsResult.data ?? []
            : [];

        setAnotaciones(loadedAnnotations);

        const accounts = Array.from(
          new Set([
            currentTarea.UsuarioCreador,
            ...currentTarea.Involucrados,
            ...loadedAnnotations.map((item) => item.UsuarioAutor),
          ]),
        );
        const profileEntries = await Promise.all(
          accounts.map(async (account) => {
            try {
              const profileResponse = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario: account }),
                signal: controller.signal,
              });
              const profileResult: UserProfileResponse =
                await profileResponse.json();

              if (
                !profileResponse.ok ||
                !profileResult.success ||
                !profileResult.data?.NombreCompleto
              ) {
                return null;
              }

              return [
                account.toLocaleLowerCase(),
                profileResult.data.NombreCompleto,
              ] as const;
            } catch (profileError) {
              if (
                !(
                  profileError instanceof DOMException &&
                  profileError.name === "AbortError"
                )
              ) {
                return null;
              }

              return null;
            }
          }),
        );

        if (!controller.signal.aborted) {
          setUserNames(
            Object.fromEntries(
              profileEntries.filter(
                (entry): entry is readonly [string, string] => entry !== null,
              ),
            ),
          );
        }

        setError("");
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar la tarea.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTarea();

    return () => controller.abort();
  }, [hasInvalidTareaId, tareaId]);

  function getDisplayName(account: string) {
    if (account.toLocaleLowerCase() === usuario.toLocaleLowerCase() && nombreCompleto) {
      return nombreCompleto;
    }

    return userNames[account.toLocaleLowerCase()] || account;
  }

  function formatDateTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  async function handleSaveAnnotation() {
    if (!tarea || !usuario || !anotacion.trim() || isSavingAnnotation) {
      return;
    }

    setIsSavingAnnotation(true);

    try {
      const response = await fetch(`/api/tareas/${tarea.IdTarea}/anotaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UsuarioAutor: usuario,
          Comentario: anotacion,
          EsComentarioCierre: false,
        }),
      });
      const result: CreateAnotacionResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "No se pudo guardar la anotación.");
      }

      setAnotaciones((current) => [...current, result.data as Anotacion]);
      setAnotacion("");
      toast.success("La anotación se agregó correctamente");
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar la anotación.",
      );
    } finally {
      setIsSavingAnnotation(false);
    }
  }

  return (
    <Box className="task-detail-page">
      <Box className="task-detail-card">
        <Box className="task-detail-card__brandbar">
          <Box className="task-detail-card__brand">
            <Box className="task-detail-card__brand-icon">
              <AssignmentOutlinedIcon />
            </Box>
            <Box>
              <Typography component="h1">Actualizar Tarea</Typography>
              <Typography component="p">
                Consulta y administra la información de la tarea.
              </Typography>
            </Box>
          </Box>
          <Chip label="Vista de tarea" size="small" />
        </Box>

        {hasInvalidTareaId ? (
          <Alert severity="error" className="task-detail-card__alert">
            La tarea solicitada no es válida.
          </Alert>
        ) : isLoading ? (
          <Box className="task-detail-card__state">Cargando tarea...</Box>
        ) : error ? (
          <Alert severity="error" className="task-detail-card__alert">
            {error}
          </Alert>
        ) : tarea ? (
          <Box className="task-detail-card__body">
            <Box className="task-detail-card__heading">
              <Chip label="Activa" size="small" className="task-detail-card__status" />
              <Typography component="h1">{tarea.Titulo}</Typography>
              <Typography component="p" className="task-detail-card__description">
                {tarea.Descripcion || "Esta tarea no tiene una descripción registrada."}
              </Typography>
            </Box>

            <Box className="task-detail-card__metadata">
              <Box className="task-detail-card__metadata-item">
                <Typography component="span">Creado por</Typography>
                <Box className="task-detail-card__metadata-value">
                  <Box className="task-detail-card__metadata-icon">
                    <PersonOutlineOutlinedIcon />
                  </Box>
                  <Typography component="strong">
                    {getDisplayName(tarea.UsuarioCreador)}
                  </Typography>
                </Box>
              </Box>
              <Box className="task-detail-card__metadata-item">
                <Typography component="span">Fecha de vencimiento</Typography>
                <Box className="task-detail-card__metadata-value">
                  <Box className="task-detail-card__metadata-icon">
                    <CalendarTodayOutlinedIcon />
                  </Box>
                  <Typography component="strong">
                    {formatDate(tarea.FechaVencimiento)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box className="task-detail-card__section">
              <Typography component="h2">Involucrados</Typography>
              <Box className="task-detail-card__chips">
                {tarea.Involucrados.length > 0 ? (
                  tarea.Involucrados.map((involucrado) => (
                    <Chip
                      label={getDisplayName(involucrado)}
                      key={involucrado}
                    />
                  ))
                ) : (
                  <Chip
                    label="Sin involucrados registrados"
                    className="task-detail-card__muted-chip"
                  />
                )}
              </Box>
            </Box>

            <Box className="task-detail-card__section task-detail-card__annotations">
              <Box className="task-detail-card__section-heading">
                <Box>
                  <ChatBubbleOutlineOutlinedIcon />
                  <Typography component="h2">Anotaciones y avances</Typography>
                </Box>
                <Chip label={anotaciones.length} size="small" />
              </Box>
              {anotaciones.length === 0 ? (
                <Box className="task-detail-card__empty-annotations">
                  Todavía no hay anotaciones para esta tarea.
                </Box>
              ) : (
                <Box className="task-detail-card__annotation-list">
                  {anotaciones.map((item) => (
                    <Box className="task-detail-card__annotation" key={item.IdAnotacion}>
                      <Box className="task-detail-card__annotation-avatar">
                        <PersonOutlineOutlinedIcon />
                      </Box>
                      <Box className="task-detail-card__annotation-content">
                        <Box className="task-detail-card__annotation-meta">
                          <Typography component="strong">
                            {getDisplayName(item.UsuarioAutor)}
                          </Typography>
                          <Typography component="span">
                            {formatDateTime(item.FechaCreacion)}
                          </Typography>
                        </Box>
                        <Typography component="p">{item.Comentario}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Box className="task-detail-card__new-note">
              <Typography component="h2">Agregar nueva anotación</Typography>
              <Typography component="p">
                Registra los avances, observaciones o actividades realizadas.
              </Typography>
              <TextField
                multiline
                minRows={3}
                maxRows={5}
                value={anotacion}
                onChange={(event) => setAnotacion(event.target.value.slice(0, 500))}
                placeholder="Ej.: Se realizó la instalación del nuevo certificado. Queda pendiente validar el funcionamiento del servicio..."
                fullWidth
              />
              <Box className="task-detail-card__note-footer">
                <Typography component="span">{anotacion.length} caracteres</Typography>
                <Button
                  variant="contained"
                  startIcon={<SaveOutlinedIcon />}
                  disabled={!anotacion.trim() || !usuario || isSavingAnnotation}
                  onClick={() => void handleSaveAnnotation()}
                  className="task-detail-card__save-note"
                >
                  {isSavingAnnotation ? "Guardando..." : "Guardar anotación"}
                </Button>
              </Box>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
