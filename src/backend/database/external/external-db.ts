import "server-only";
import sql from "mssql";

let poolPromise: Promise<sql.ConnectionPool> | null = null;

export async function getExternalPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    const config: sql.config = {
      server: process.env.EXTERNAL_DB_HOST ?? "",
      port: Number(process.env.EXTERNAL_DB_PORT ?? 1433),
      user: process.env.EXTERNAL_DB_USERNAME,
      password: process.env.EXTERNAL_DB_PASSWORD,
      database: process.env.EXTERNAL_DB_DATABASE,
      connectionTimeout: 15000,
      requestTimeout: 30000,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };

    poolPromise = new sql.ConnectionPool(config).connect().catch((error) => {
      poolPromise = null;
      throw error;
    });
  }

  return poolPromise;
}
