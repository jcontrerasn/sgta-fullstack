import { AppShell } from "@/frontend/components/layout/app-shell";
import { NuevaTareaView } from "@/frontend/modules/tareas/components/nueva-tarea-view";

export default function NuevaTareaPage() {
  return (
    <AppShell>
      <NuevaTareaView />
    </AppShell>
  );
}
