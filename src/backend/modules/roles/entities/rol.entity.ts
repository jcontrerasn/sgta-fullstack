import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";

import type { UsuarioRolEntity } from "./usuario-rol.entity";

@Entity({ name: "Roles", schema: "dbo" })
export class RolEntity {
  @PrimaryGeneratedColumn({
    name: "IdRol",
    type: "int",
  })
  idRol!: number;

  @Column({
    name: "Nombre",
    type: "varchar",
    length: 50,
    unique: true,
  })
  nombre!: string;

  @Column({
    name: "Descripcion",
    type: "nvarchar",
    length: 200,
    nullable: true,
  })
  descripcion!: string | null;

  @Column({
    name: "Activo",
    type: "bit",
    default: true,
  })
  activo!: boolean;

  @OneToMany("UsuarioRolEntity", "rol")
  usuariosRoles!: UsuarioRolEntity[];
}
