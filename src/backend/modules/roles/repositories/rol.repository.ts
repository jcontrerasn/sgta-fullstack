import "server-only";

import { getDataSource } from "@/backend/database/typeorm/data-source";
import { UsuarioRolEntity } from "../entities/usuario-rol.entity";

export async function findActiveRoleByUsername(
  usuario: string,
): Promise<string | null> {
  const dataSource = await getDataSource();
  const assignments = await dataSource
    .getRepository(UsuarioRolEntity)
    .find({
      where: {
        usuario,
        activo: true,
      },
      relations: {
        rol: true,
      },
      order: {
        idUsuarioRol: "ASC",
      },
    });

  return assignments.find((assignment) => assignment.rol.activo)?.rol.nombre ?? null;
}
