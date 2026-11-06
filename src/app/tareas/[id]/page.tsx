import { AppShell } from "@/frontend/components/layout/app-shell";
import { TareaDetalleView } from "@/frontend/modules/tareas/components/tarea-detalle-view";

export default function TareaDetallePage() {
  return (
    <AppShell>
      <TareaDetalleView />
    </AppShell>
  );
}
