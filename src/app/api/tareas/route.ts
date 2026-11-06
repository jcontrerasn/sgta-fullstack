import { NextResponse } from "next/server";

import { findActiveRoleByUsername } from
  "@/backend/modules/roles/repositories/rol.repository";
import type { CreateTareaRequestDto } from "@/backend/modules/tareas/dto/request/create-tarea-request.dto";
import {
  getAllTareas,
  registerTarea,
} from "@/backend/modules/tareas/services/tarea.service";
import { createTareaSchema } from "@/shared/schemas/create-tarea.schema";

export const runtime = "nodejs";

function normalizeRole(value: string | null) {
  return (value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_")
    .toLocaleLowerCase();
}

export async function GET() {
  try {
    const tareas = await getAllTareas();

    return NextResponse.json({
      success: true,
      data: tareas,
    });
  } catch (error) {
    console.error(
      "Error al obtener las tareas:",
      error instanceof Error ? error.message : "Error desconocido",
    );

    return NextResponse.json(
      {
        success: false,
        message: "No se pudieron obtener las tareas.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = createTareaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Los datos de la tarea son inválidos.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const tareaRequest: CreateTareaRequestDto = parsed.data;
    const rol = await findActiveRoleByUsername(tareaRequest.UsuarioCreador);
    const normalizedRole = normalizeRole(rol);

    if (["usuario", "tecnico_soporte"].includes(normalizedRole)) {
      return NextResponse.json(
        {
          success: false,
          message: "Tu rol no permite crear tareas.",
        },
        { status: 403 },
      );
    }

    const tarea = await registerTarea(tareaRequest);

    return NextResponse.json(
      {
        success: true,
        data: tarea,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Error al registrar la tarea:",
      error instanceof Error ? error.message : "Error desconocido",
    );

    return NextResponse.json(
      { success: false, message: "No se pudo registrar la tarea." },
      { status: 500 },
    );
  }
}
