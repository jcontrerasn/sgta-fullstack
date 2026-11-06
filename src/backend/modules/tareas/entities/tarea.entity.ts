import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import type { TareaInvolucradoEntity } from "./tarea-involucrados.entity";
import type { TareaAnotacion } from "./tarea-anotaciones.entity";

@Entity({ name: "Tareas", schema: "dbo" })
export class TareaEntity {
  @PrimaryGeneratedColumn({
    name: "IdTarea",
    type: "int",
  })
  idTarea!: number;

  @Column({
    name: "Titulo",
    type: "nvarchar",
    length: 120,
  })
  titulo!: string;

  @Column({
    name: "Descripcion",
    type: "nvarchar",
    length: "MAX",
  })
  descripcion!: string;

  @Column({
    name: "FechaVencimiento",
    type: "date",
  })
  fechaVencimiento!: string;

  @Column({
    name: "UsuarioCreador",
    type: "varchar",
    length: 100,
  })
  usuarioCreador!: string;

  @CreateDateColumn({
    name: "FechaCreacion",
    type: "datetime2",
    precision: 0,
    default: () =>
      "CONVERT(DATETIME2(7), SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'SA Pacific Standard Time')",
  })
  fechaCreacion!: Date;

  @Column({
    name: "FechaModificacion",
    type: "datetime2",
    precision: 0,
    nullable: true,
  })
  fechaModificacion!: Date | null;

  @Column({
    name: "FechaCierre",
    type: "datetime2",
    precision: 0,
    nullable: true,
  })
  fechaCierre!: Date | null;

  @Column({
    name: "FechaEliminacion",
    type: "datetime2",
    precision: 0,
    nullable: true,
  })
  fechaEliminacion!: Date | null;

  @Column({
    name: "IdUsuarioEliminacion",
    type: "int",
    nullable: true,
  })
  idUsuarioEliminacion!: number | null;

  @OneToMany("TareaInvolucradoEntity", "tarea")
  involucrados!: TareaInvolucradoEntity[];

  @OneToMany("TareaAnotacion", "tarea")
  anotaciones!: TareaAnotacion[];
}
