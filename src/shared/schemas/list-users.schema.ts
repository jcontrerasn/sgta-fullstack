import { z } from "zod";

export const listUsersSchema = z.object({
  filtro: z.string().trim().min(1, "El filtro es obligatorio"),
});

export type ListUsersRequest = z.infer<typeof listUsersSchema>;
