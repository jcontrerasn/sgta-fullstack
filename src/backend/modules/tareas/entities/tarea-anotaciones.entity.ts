import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
} from "typeorm";

import { TareaEntity } from "./tarea.entity";

@Entity({ name: "TareaAnotaciones", schema: "dbo" })
@Check(
  "CK_TareaAnotaciones_Comentario",
  "LEN(TRIM(Comentario)) > 0"
)
@Check(
  "CK_TareaAnotaciones_UsuarioAutor",
  "LEN(TRIM(UsuarioAutor)) > 0"
)
export class TareaAnotacion {
  @PrimaryGeneratedColumn({
    name: "IdAnotacion",
    type: "int",
  })
  idAnotacion!: number;

  @Column({
    name: "IdTarea",
    type: "int",
  })
  idTarea!: number;

  @Column({
    name: "UsuarioAutor",
    type: "varchar",
    length: 100,
  })
  usuarioAutor!: string;

  @Column({
    name: "Comentario",
    type: "nvarchar",
    length: "MAX",
  })
  comentario!: string;

  @Column({
    name: "EsComentarioCierre",
    type: "bit",
    default: false,
  })
  esComentarioCierre!: boolean;

  @Column({
    name: "FechaCreacion",
    type: "datetime2",
    precision: 0,
    insert: false,
    update: false,
    default: () =>
      "CONVERT(DATETIME2(0), SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'SA Pacific Standard Time')",
  })
  fechaCreacion!: Date;

  @ManyToOne(
    () => TareaEntity,
    (tarea) => tarea.anotaciones,
    {
      nullable: false,
      onDelete: "NO ACTION",
    }
  )
  @JoinColumn({
    name: "IdTarea",
    referencedColumnName: "idTarea",
    foreignKeyConstraintName: "FK_TareaAnotaciones_Tareas",
  })
  tarea!: TareaEntity;
}