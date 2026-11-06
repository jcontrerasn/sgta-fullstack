import { z } from "zod";

export const loginSchema = z.object({
  usuario: z.string().trim().min(1, "El usuario es obligatorio"),
});

export type LoginRequest = z.infer<typeof loginSchema>;
