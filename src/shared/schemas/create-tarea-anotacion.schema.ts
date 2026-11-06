import { z } from "zod";

export const createTareaAnotacionSchema = z.object({
  UsuarioAutor: z
    .string()
    .trim()
    .min(1, "El usuario autor es obligatorio")
    .max(100, "El usuario autor no puede superar los 100 caracteres"),
  Comentario: z
    .string()
    .trim()
    .min(1, "El comentario es obligatorio")
    .max(2000, "El comentario no puede superar los 2000 caracteres"),
  EsComentarioCierre: z.boolean().default(false),
});

export type CreateTareaAnotacionRequest = z.infer<
  typeof createTareaAnotacionSchema
>;
