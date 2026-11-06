import "server-only";
import "reflect-metadata";

import { DataSource } from "typeorm";
import { TareaEntity } from "@/backend/modules/tareas/entities/tarea.entity";
import { TareaInvolucradoEntity } from
  "@/backend/modules/tareas/entities/tarea-involucrados.entity";
import { TareaAnotacion } from
  "@/backend/modules/tareas/entities/tarea-anotaciones.entity";
import { UsuarioRolEntity } from "@/backend/modules/roles/entities/usuario-rol.entity";
import { RolEntity } from "@/backend/modules/roles/entities/rol.entity";

const dataSource = new DataSource({
  type: "mssql",
  host: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT ?? 1433),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [TareaEntity, TareaInvolucradoEntity, TareaAnotacion, RolEntity, UsuarioRolEntity],
  synchronize: false,
  migrationsRun: false,
  dropSchema: false,
  
  connectionTimeout: 15000,

  options: {
        encrypt: false,
        trustServerCertificate: true,
    },
});

let connectionPromise: Promise<DataSource> | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (dataSource.isInitialized) {
    return dataSource;
  }

  if (!connectionPromise) {
    connectionPromise = dataSource.initialize().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
}
