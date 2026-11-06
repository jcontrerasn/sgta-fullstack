import { z } from "zod";

export const searchUserByFullNameSchema = z.object({
  Pfiltro_c: z.string().trim().min(1, "El filtro es obligatorio"),
});

export type SearchUserByFullNameRequest = z.infer<
  typeof searchUserByFullNameSchema
>;
