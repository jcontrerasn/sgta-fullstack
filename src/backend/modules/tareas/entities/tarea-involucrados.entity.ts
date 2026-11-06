import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Check,
} from "typeorm";

import { TareaEntity } from "./tarea.entity";

@Entity({ name: "TareaInvolucrados", schema: "dbo" })
@Unique("UQ_TareaInvolucrados_Tarea_Usuario", [
  "idTarea",
  "usuario",
])
@Check(
  "CK_TareaInvolucrados_Usuario",
  "LEN(TRIM(Usuario)) > 0"
)
export class TareaInvolucradoEntity {
  @PrimaryGeneratedColumn({
    name: "IdTareaInvolucrado",
    type: "int",
  })
  idTareaInvolucrado!: number;

  @Column({
    name: "IdTarea",
    type: "int",
  })
  idTarea!: number;

  @Column({
    name: "Usuario",
    type: "varchar",
    length: 100,
  })
  usuario!: string;

  @Column({
    name: "FechaAsignacion",
    type: "datetime2",
    precision: 0,
    insert: false,
    update: false,
    default: () =>
      "CONVERT(DATETIME2(0), SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'SA Pacific Standard Time')",
  })
  fechaAsignacion!: Date;

  @ManyToOne(
    () => TareaEntity,
    (tarea) => tarea.involucrados,
    { nullable: false }
  )
  @JoinColumn({
    name: "IdTarea",
    referencedColumnName: "idTarea",
    foreignKeyConstraintName: "FK_TareaInvolucrados_Tareas",
  })
  tarea!: TareaEntity;
}