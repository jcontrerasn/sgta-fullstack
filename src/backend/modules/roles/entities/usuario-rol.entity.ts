import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";

import { RolEntity } from "./rol.entity";

@Entity({ name: "UsuarioRoles", schema: "dbo" })
@Unique("UQ_UsuarioRoles", ["usuario", "idRol"])
export class UsuarioRolEntity {
  @PrimaryGeneratedColumn({
    name: "IdUsuarioRol",
    type: "int",
  })
  idUsuarioRol!: number;

  @Column({
    name: "Usuario",
    type: "varchar",
    length: 100,
  })
  usuario!: string;

  @Column({
    name: "IdRol",
    type: "int",
  })
  idRol!: number;

  @Column({
    name: "Activo",
    type: "bit",
    default: true,
  })
  activo!: boolean;

  @ManyToOne(
    () => RolEntity,
    (rol) => rol.usuariosRoles,
    {
      nullable: false,
      onDelete: "NO ACTION",
    }
  )
  @JoinColumn({
    name: "IdRol",
    referencedColumnName: "idRol",
    foreignKeyConstraintName: "FK_UsuarioRoles_Roles",
  })
  rol!: RolEntity;
}