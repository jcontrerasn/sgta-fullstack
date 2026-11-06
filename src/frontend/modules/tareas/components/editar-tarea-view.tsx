"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Avatar,
  Box,
  Button,
  Chip,
  TextField,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
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

type UserOption = {
  Usuario: string;
  NombreCompleto: string;
  Area: string;
};

type UsersResponse = {
  success?: boolean;
  data?: UserOption[];
};

export function EditarTareaView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const usuario = useAuthStore((state) => state.usuario);
  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [involucrados, setInvolucrados] = useState<string[]>([]);
  const [involucradoNames, setInvolucradoNames] = useState<Record<string, string>>({});
  const [involucradoQuery, setInvolucradoQuery] = useState("");
  const [selectedInvolucrado, setSelectedInvolucrado] =
    useState<UserOption | null>(null);
  const [involvedOptions, setInvolvedOptions] = useState<UserOption[]>([]);
  const [isSearchingInvolved, setIsSearchingInvolved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const involvedPickerRef = useRef<HTMLDivElement>(null);
  const tareaId = useMemo(() => Number(params.id), [params.id]);
  const hasInvalidTareaId = !Number.isInteger(tareaId) || tareaId < 1;

  useEffect(() => {
    if (hasInvalidTareaId) {
      return;
    }

    const controller = new AbortController();

    async function loadTarea() {
      try {
        const response = await fetch("/api/tareas", {
          signal: controller.signal,
        });
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
        setTitulo(currentTarea.Titulo);
        setDescripcion(currentTarea.Descripcion);
        setFechaVencimiento(currentTarea.FechaVencimiento);
        setInvolucrados(currentTarea.Involucrados ?? []);
        setInvolucradoNames({});
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

  useEffect(() => {
    if (selectedInvolucrado) {
      return;
    }

    const query = involucradoQuery.trim();
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      if (!query) {
        setInvolvedOptions([]);
        setIsSearchingInvolved(false);
        return;
      }

      setIsSearchingInvolved(true);

      try {
        const response = await fetch("/api/auth/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filtro: query }),
          signal: controller.signal,
        });
        const result: UsersResponse = await response.json();

        setInvolvedOptions(response.ok && result.success ? result.data ?? [] : []);
      } catch (searchError) {
        if (!(searchError instanceof DOMException && searchError.name === "AbortError")) {
          setInvolvedOptions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingInvolved(false);
        }
      }
    }, query ? 250 : 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [involucradoQuery, selectedInvolucrado]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        involvedPickerRef.current &&
        !involvedPickerRef.current.contains(event.target as Node) &&
        !selectedInvolucrado
      ) {
        setInvolucradoQuery("");
        setInvolvedOptions([]);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [selectedInvolucrado]);

  function handleReset() {
    if (!tarea) {
      return;
    }

    setTitulo(tarea.Titulo);
    setDescripcion(tarea.Descripcion);
    setFechaVencimiento(tarea.FechaVencimiento);
    setInvolucrados(tarea.Involucrados ?? []);
    setInvolucradoNames({});
    setInvolucradoQuery("");
    setSelectedInvolucrado(null);
    setInvolvedOptions([]);
  }

  function handleAddInvolucrado() {
    if (!selectedInvolucrado || involucrados.length >= 5) {
      return;
    }

    const alreadyAdded = involucrados.some(
      (item) =>
        item.toLocaleLowerCase() ===
        selectedInvolucrado.Usuario.toLocaleLowerCase(),
    );

    if (!alreadyAdded) {
      setInvolucrados((current) => [...current, selectedInvolucrado.Usuario]);
      setInvolucradoNames((current) => ({
        ...current,
        [selectedInvolucrado.Usuario.toLocaleLowerCase()]:
          selectedInvolucrado.NombreCompleto,
      }));
    }

    setInvolucradoQuery("");
    setSelectedInvolucrado(null);
    setInvolvedOptions([]);
  }

  function getInvolucradoName(account: string) {
    return involucradoNames[account.toLocaleLowerCase()] || account;
  }

  function getInvolucradoInitials(value: string) {
    const parts = value
      .replace(",", " ")
      .split(/\s+/)
      .filter(Boolean);

    return `${parts[0]?.charAt(0) ?? ""}${parts[1]?.charAt(0) ?? ""}`.toUpperCase();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tarea || !usuario || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/tareas/${tarea.IdTarea}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UsuarioEditor: usuario,
          Titulo: titulo,
          Descripcion: descripcion,
          FechaVencimiento: fechaVencimiento,
          Involucrados: involucrados,
        }),
      });
      const result: { success?: boolean; message?: string } =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "No se pudo actualizar la tarea.");
      }

      toast.success("La tarea se actualizó correctamente");
      router.push("/");
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar la tarea.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!tarea || !usuario || isDeleting || isSaving) {
      return;
    }

    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar esta tarea?",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tareas/${tarea.IdTarea}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UsuarioEliminacion: usuario }),
      });
      const result: { success?: boolean; message?: string } =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "No se pudo eliminar la tarea.");
      }

      toast.success("La tarea se eliminó correctamente");
      router.push("/");
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar la tarea.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Box className="edit-task-page">
      <Box
        component="form"
        className="edit-task-card"
        onSubmit={handleSubmit}
      >
        {hasInvalidTareaId ? (
          <Box className="edit-task-card__state edit-task-card__state--error">
            La tarea solicitada no es válida.
          </Box>
        ) : isLoading ? (
          <Box className="edit-task-card__state">Cargando tarea...</Box>
        ) : error ? (
          <Box className="edit-task-card__state edit-task-card__state--error">
            {error}
          </Box>
        ) : tarea ? (
          <>
            <Box className="edit-task-card__header">
              <Box className="edit-task-card__heading-content">
                <Box className="edit-task-card__header-icon">
                  <AssignmentOutlinedIcon />
                </Box>
                <Box>
                  <Typography component="h1">Actualizar tarea</Typography>
                  <Typography component="p">
                    Actualiza los datos de la tarea registrada.
                  </Typography>
                </Box>
              </Box>
              <Chip label="Activa" size="small" className="edit-task-card__status" />
            </Box>

            <Box className="edit-task-card__fields">
              <Box className="edit-task-card__field edit-task-card__title-field">
                <Box className="edit-task-card__label-row">
                  <Typography
                    component="label"
                    htmlFor="edit-task-title"
                  >
                    Título de la tarea <span>*</span>
                  </Typography>
                  <Typography component="small" className="edit-task-card__counter">
                    {titulo.length}/120
                  </Typography>
                </Box>
                <TextField
                  id="edit-task-title"
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 120 } }}
                  fullWidth
                />
              </Box>

              <Box className="edit-task-card__field edit-task-card__description-field">
                <Box className="edit-task-card__label-row">
                  <Typography
                    component="label"
                    htmlFor="edit-task-description"
                  >
                    Descripción <span>*</span>
                  </Typography>
                  <Typography component="small" className="edit-task-card__counter">
                    {descripcion.length}/500
                  </Typography>
                </Box>
                <TextField
                  id="edit-task-description"
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                  multiline
                  minRows={3}
                  fullWidth
                />
              </Box>

              <Box className="edit-task-card__field edit-task-card__date-field">
                <Box className="edit-task-card__label-row">
                  <Typography
                    component="label"
                    htmlFor="edit-task-date"
                  >
                    Fecha de vencimiento <span>*</span>
                  </Typography>
                </Box>
                <TextField
                  id="edit-task-date"
                  type="date"
                  value={fechaVencimiento}
                  onChange={(event) => setFechaVencimiento(event.target.value)}
                  fullWidth
                />
              </Box>

              <Box className="edit-task-card__field edit-task-card__involved-field">
                <Box className="edit-task-card__field-heading">
                  <Box className="edit-task-card__involved-heading">
                    <GroupOutlinedIcon />
                    <Typography component="label">Involucrados</Typography>
                  </Box>
                  <Typography component="small">{involucrados.length}/5</Typography>
                </Box>
                <Box className="edit-task-card__involved-picker" ref={involvedPickerRef}>
                  <Box className="edit-task-card__involved-input">
                    <TextField
                      id="edit-task-involved"
                      placeholder="Ingresa una cuenta de usuario"
                      value={involucradoQuery}
                      onChange={(event) => {
                        setSelectedInvolucrado(null);
                        setInvolucradoQuery(event.target.value);
                      }}
                      fullWidth
                    />
                    <Button
                      type="button"
                      variant="outlined"
                      startIcon={<AddRoundedIcon />}
                      onClick={handleAddInvolucrado}
                      disabled={!selectedInvolucrado || involucrados.length >= 5}
                      className="edit-task-card__add-involved"
                    >
                      Añadir
                    </Button>
                  </Box>
                  {involucradoQuery.trim() && !selectedInvolucrado ? (
                    <Box className="edit-task-card__user-options" role="listbox">
                      {isSearchingInvolved ? (
                        <Typography className="edit-task-card__user-options-status">
                          Buscando usuarios...
                        </Typography>
                      ) : involvedOptions.length > 0 ? (
                        involvedOptions.map((option) => (
                          <Box
                            component="button"
                            type="button"
                            key={option.Usuario}
                            className="edit-task-card__user-option"
                            onClick={() => {
                              setSelectedInvolucrado(option);
                              setInvolucradoQuery(option.NombreCompleto);
                              setInvolvedOptions([]);
                            }}
                          >
                            <Box className="edit-task-card__user-option-avatar">
                              {getInvolucradoInitials(option.NombreCompleto)}
                            </Box>
                            <Box className="edit-task-card__user-option-copy">
                              <Typography component="span">
                                {option.NombreCompleto}
                              </Typography>
                              <Typography component="span">
                                {option.Usuario} · {option.Area}
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Typography className="edit-task-card__user-options-status">
                          No se encontraron usuarios.
                        </Typography>
                      )}
                    </Box>
                  ) : null}
                </Box>
                <Box className="edit-task-card__chips">
                  {involucrados.length > 0 ? (
                    involucrados.map((involucrado) => (
                      <Chip
                        key={involucrado}
                        label={getInvolucradoName(involucrado)}
                        avatar={
                          <Avatar>
                            {getInvolucradoInitials(getInvolucradoName(involucrado))}
                          </Avatar>
                        }
                        onDelete={() =>
                          setInvolucrados((current) =>
                            current.filter((item) => item !== involucrado),
                          )
                        }
                        className="edit-task-card__involved-chip"
                      />
                    ))
                  ) : (
                    <Typography component="span" className="edit-task-card__empty-involved">
                      
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Box className="edit-task-card__actions">
              <Button
                type="button"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={() => void handleDelete()}
                disabled={isDeleting || isSaving}
                className="edit-task-card__delete-button"
              >
                {isDeleting ? "Eliminando..." : "Eliminar tarea"}
              </Button>
              <Button
                type="button"
                startIcon={<RestartAltRoundedIcon />}
                onClick={handleReset}
                className="edit-task-card__reset-button"
              >
                Restablecer
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                disabled={isSaving || isDeleting}
                className="edit-task-card__save-button"
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  );
}
