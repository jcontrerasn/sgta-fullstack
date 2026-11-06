import { NextResponse } from "next/server";
import { getDataSource } from "@/backend/database/typeorm/data-source";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDataSource();

    const result = await db.query(
      "SELECT 1 AS connected, DB_NAME() AS databaseName",
    );

    return NextResponse.json({
      success: true,
      message: "Conexión exitosa a SQL Server",
      data: result[0],
    });
  } catch (error) {
    console.error("Error de conexión SQL Server:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No se pudo conectar a SQL Server",
      },
      { status: 500 },
    );
  }
}