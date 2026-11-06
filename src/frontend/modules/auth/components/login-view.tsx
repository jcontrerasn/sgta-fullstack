"use client";

import { useState, type FormEvent } from "react";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { Alert, Box, Button, Paper, TextField } from "@mui/material";

type LoginViewProps = {
  onLogin: (usuario: string) => Promise<void>;
};

export function LoginView({ onLogin }: LoginViewProps) {
  const [usuario, setUsuario] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedUsuario = usuario.trim().toUpperCase();

    if (!normalizedUsuario) {
      setError("Ingresa tu usuario para continuar.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onLogin(normalizedUsuario);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "No se pudo iniciar sesión.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box className="login-page">
      <Paper component="section" elevation={0} className="login-card">
        <Box className="login-card__brand">
          <Box
            component="img"
            src="/images/logo.png"
            alt="SGTA"
            className="login-card__logo"
          />
        </Box>

        <Box
          component="form"
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <TextField
            label="Usuario"
            placeholder="Ej. JCONTRERASN"
            value={usuario}
            onChange={(event) => setUsuario(event.target.value)}
            autoComplete="username"
            autoFocus
            fullWidth
            disabled={isSubmitting}
          />
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            startIcon={<LoginRoundedIcon />}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
