import { z } from "zod";

export const deleteTareaSchema = z.object({
  UsuarioEliminacion: z
    .string()
    .trim()
    .min(1, "El usuario eliminador es obligatorio")
    .max(100, "El usuario eliminador no puede superar los 100 caracteres"),
});

export type DeleteTareaRequest = z.infer<typeof deleteTareaSchema>;
