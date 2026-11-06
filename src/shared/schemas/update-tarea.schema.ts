import { z } from "zod";

const validDateOnly = z
  .string()
  .trim()
  .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, "La fecha debe tener el formato YYYY-MM-DD")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, "La fecha de vencimiento no es válida");

export const updateTareaSchema = z.object({
  UsuarioEditor: z
    .string()
    .trim()
    .min(1, "El usuario editor es obligatorio")
    .max(100, "El usuario editor no puede superar los 100 caracteres"),
  Titulo: z.string().trim().min(1, "El título es obligatorio").max(120),
  Descripcion: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres"),
  FechaVencimiento: validDateOnly,
  Involucrados: z
    .array(
      z
        .string()
        .trim()
        .min(1, "El usuario involucrado es obligatorio")
        .max(100, "El usuario involucrado no puede superar los 100 caracteres"),
    )
    .max(5, "No se pueden agregar más de 5 involucrados")
    .default([]),
});

export type UpdateTareaRequest = z.infer<typeof updateTareaSchema>;
