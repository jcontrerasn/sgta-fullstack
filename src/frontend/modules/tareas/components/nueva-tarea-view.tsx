"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { toast } from "sonner";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  TextField,
  Typography,
} from "@mui/material";
import { useAuthStore } from "@/frontend/stores/auth.store";

type UserOption = {
  Usuario: string;
  NombreCompleto: string;
  Area: string;
};

export function NuevaTareaView() {
  const router = useRouter();
  const usuarioCreador = useAuthStore((state) => state.usuario);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [involucradoQuery, setInvolucradoQuery] = useState("");
  const [selectedInvolucrado, setSelectedInvolucrado] =
    useState<UserOption | null>(null);
  const [involvedOptions, setInvolvedOptions] = useState<UserOption[]>([]);
  const [involucrados, setInvolucrados] = useState<UserOption[]>([]);
  const [isSearchingInvolved, setIsSearchingInvolved] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const involvedPickerRef = useRef<HTMLDivElement>(null);

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
        const result: { success?: boolean; data?: UserOption[] } =
          await response.json();

        if (response.ok && result.success) {
          setInvolvedOptions(result.data ?? []);
        } else {
          setInvolvedOptions([]);
        }
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

  function handleAddInvolucrado() {
    if (!selectedInvolucrado) {
      return;
    }

    if (
      !involucrados.some(
        (item) => item.Usuario === selectedInvolucrado.Usuario,
      )
    ) {
      setInvolucrados((current) => [...current, selectedInvolucrado]);
    }

    setInvolucradoQuery("");
    setSelectedInvolucrado(null);
    setInvolvedOptions([]);
  }

  function handleRemoveInvolucrado(value: UserOption) {
    setInvolucrados((current) =>
      current.filter((item) => item.Usuario !== value.Usuario),
    );
  }

  function getInvolucradoInitials(value: string) {
    const [surnames, names] = value.includes(",")
      ? value.split(",", 2).map((part) => part.trim())
      : ["", value.trim()];
    const firstName = (names || value).split(/\s+/)[0] ?? "";
    const firstSurname = surnames
      ? surnames.split(/\s+/)[0]
      : value.trim().split(/\s+/)[1] ?? "";

    return `${firstName.charAt(0)}${firstSurname.charAt(0)}`.toUpperCase();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!usuarioCreador) {
      setError("No se encontró el usuario creador de la tarea.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Titulo: titulo,
          Descripcion: descripcion,
          FechaVencimiento: fechaVencimiento,
          UsuarioCreador: usuarioCreador,
          Involucrados: involucrados.map((item) => item.Usuario),
        }),
      });

      const result: { success?: boolean; message?: string } =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "No se pudo guardar la tarea.");
      }

      toast.success("La tarea se creó correctamente");
      router.push("/");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar la tarea.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Box className="new-task-page">
      <Box
        component="form"
        className="new-task-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <Box className="new-task-form__header">
          <Box className="new-task-form__header-icon">
            <AssignmentOutlinedIcon />
          </Box>
          <Box>
            <Typography component="h1">Nueva tarea</Typography>
            <Typography component="p">
              Completa los campos requeridos <span aria-hidden="true">*</span> para continuar.
            </Typography>
          </Box>
        </Box>

        <Box className="new-task-form__fields">
          <Box className="new-task-form__field new-task-form__title">
            <Box className="new-task-form__label-row">
              <Typography component="label" htmlFor="task-title" className="new-task-form__label">
                Título de la tarea <span aria-hidden="true">*</span>
              </Typography>
              <Typography component="small" className="new-task-form__counter">
                {titulo.length}/120
              </Typography>
            </Box>
            <TextField
              id="task-title"
              placeholder="Ingresa el título de la tarea"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 120 } }}
              required
              fullWidth
            />
          </Box>
          <Box className="new-task-form__field new-task-form__date">
            <Typography component="label" htmlFor="task-due-date" className="new-task-form__label">
              Fecha de vencimiento <span aria-hidden="true">*</span>
            </Typography>
            <TextField
              id="task-due-date"
              type="date"
              value={fechaVencimiento}
              onChange={(event) => setFechaVencimiento(event.target.value)}
              required
              fullWidth
            />
          </Box>
          <Box className="new-task-form__field new-task-form__description">
            <Box className="new-task-form__label-row">
              <Typography component="label" htmlFor="task-description" className="new-task-form__label">
                Descripción
              </Typography>
              <Typography component="small" className="new-task-form__counter">
                {descripcion.length}/500
              </Typography>
            </Box>
            <TextField
              id="task-description"
              placeholder="Describe brevemente la tarea"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              multiline
              rows={3}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              fullWidth
            />
          </Box>
          <Box className="new-task-form__involved" component="section">
            <Box className="new-task-form__involved-heading">
              <GroupOutlinedIcon />
              <Box>
                <Typography component="label" htmlFor="task-involved" className="new-task-form__label">
                  Involucrados
                </Typography>
                <Typography component="p" className="new-task-form__involved-help">
                  Añade las cuentas de las personas que participarán en esta tarea.
                </Typography>
              </Box>
            </Box>
            <Box className="new-task-form__involved-picker" ref={involvedPickerRef}>
              <Box className="new-task-form__involved-input">
                <TextField
                  id="task-involved"
                  placeholder="Ingresa una cuenta de usuario"
                  value={involucradoQuery}
                  onChange={(event) => {
                    setSelectedInvolucrado(null);
                    setInvolucradoQuery(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddInvolucrado();
                    }
                  }}
                  fullWidth
                />
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                  onClick={handleAddInvolucrado}
                  disabled={!selectedInvolucrado}
                  className="new-task-form__add-involved"
                >
                  Añadir
                </Button>
              </Box>

              {involucradoQuery.trim() && !selectedInvolucrado ? (
                <Box className="new-task-form__user-options" role="listbox">
                  {isSearchingInvolved ? (
                    <Typography className="new-task-form__user-options-status">
                      Buscando usuarios...
                    </Typography>
                  ) : involvedOptions.length > 0 ? (
                    involvedOptions.map((option) => (
                      <Box
                        component="button"
                        type="button"
                        key={option.Usuario}
                        className="new-task-form__user-option"
                        onClick={() => {
                          setSelectedInvolucrado(option);
                          setInvolucradoQuery(option.NombreCompleto);
                          setInvolvedOptions([]);
                        }}
                      >
                        <Box className="new-task-form__user-option-avatar">
                          {getInvolucradoInitials(option.NombreCompleto)}
                        </Box>
                        <Box className="new-task-form__user-option-copy">
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
                    <Typography className="new-task-form__user-options-status">
                      No se encontraron usuarios.
                    </Typography>
                  )}
                </Box>
              ) : null}
            </Box>

            {involucrados.length > 0 ? (
              <Box className="new-task-form__chips">
                {involucrados.map((item) => (
                  <Chip
                    key={item.Usuario}
                    label={item.NombreCompleto}
                    avatar={<Avatar>{getInvolucradoInitials(item.NombreCompleto)}</Avatar>}
                    deleteIcon={<CloseRoundedIcon />}
                    onDelete={() => handleRemoveInvolucrado(item)}
                  />
                ))}
              </Box>
            ) : null}
          </Box>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box className="new-task-form__actions">
          <Button
            type="button"
            variant="outlined"
            onClick={() => router.push("/")}
            className="new-task-form__cancel-button"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            disabled={isSaving}
            className="new-task-form__save-button"
          >
            {isSaving ? "Guardando..." : "Guardar tarea"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
