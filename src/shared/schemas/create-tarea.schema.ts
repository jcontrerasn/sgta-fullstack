import { z } from "zod";

const validDateOnly = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, "La fecha de vencimiento no es válida");

export const createTareaSchema = z.object({
  Titulo: z.string().trim().min(1, "El título es obligatorio").max(120),
  Descripcion: z.string().trim().max(500, "La descripción no puede superar los 500 caracteres"),
  FechaVencimiento: validDateOnly,
  UsuarioCreador: z
    .string()
    .trim()
    .min(1, "El usuario creador es obligatorio")
    .max(100, "El usuario creador no puede superar los 100 caracteres"),
  Involucrados: z
    .array(
      z
        .string()
        .trim()
        .min(1, "El usuario involucrado es obligatorio")
        .max(100, "El usuario involucrado no puede superar los 100 caracteres"),
    )
    .max(100, "No se pueden agregar más de 100 involucrados")
    .default([]),
});

export type CreateTareaRequest = z.infer<typeof createTareaSchema>;
