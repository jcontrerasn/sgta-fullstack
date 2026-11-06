"use client";

import { Box } from "@mui/material";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { TareasAsignadasCard } from "@/frontend/modules/tareas/components/tareas-asignadas-card";
import { TareasCreadasCard } from "@/frontend/modules/tareas/components/tareas-creadas-card";

export default function Home() {
  return (
    <AppShell>
      <Box className="home-page" aria-label="Página de inicio">
        <Box className="tareas-home-grid">
          <Box className="tareas-home-column">
            <TareasAsignadasCard />
          </Box>
          <TareasCreadasCard />
        </Box>
      </Box>
    </AppShell>
  );
}
