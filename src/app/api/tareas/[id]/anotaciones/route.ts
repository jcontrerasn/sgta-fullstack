import { NextResponse } from "next/server";

import type { CreateTareaAnotacionRequestDto } from
  "@/backend/modules/tareas/dto/request/create-tarea-anotacion-request.dto";
import { getTareaAnotaciones, registerTareaAnotacion } from
  "@/backend/modules/tareas/services/tarea.service";
import { createTareaAnotacionSchema } from
  "@/shared/schemas/create-tarea-anotacion.schema";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getTaskId(context: RouteContext) {
  const { id } = await context.params;
  const idTarea = Number(id);

  return Number.isInteger(idTarea) && idTarea > 0 ? idTarea : null;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const idTarea = await getTaskId(context);

    if (!idTarea) {
      return NextResponse.json(
        {
          success: false,
          message: "El identificador de la tarea no es válido.",
        },
        { status: 400 },
      );
    }

    const anotaciones = await getTareaAnotaciones(idTarea);

    if (!anotaciones) {
      return NextResponse.json(
        { success: false, message: "La tarea no existe." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: anotaciones });
  } catch (error) {
    console.error(
      "Error al obtener las anotaciones:",
      error instanceof Error ? error.message : "Error desconocido",
    );

    return NextResponse.json(
      { success: false, message: "No se pudieron obtener las anotaciones." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const idTarea = await getTaskId(context);

    if (!idTarea) {
      return NextResponse.json(
        {
          success: false,
          message: "El identificador de la tarea no es válido.",
        },
        { status: 400 },
      );
    }

    const body: unknown = await request.json();
    const parsed = createTareaAnotacionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Los datos de la anotación son inválidos.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const anotacionRequest: CreateTareaAnotacionRequestDto = parsed.data;
    const anotacion = await registerTareaAnotacion(idTarea, anotacionRequest);

    if (!anotacion) {
      return NextResponse.json(
        { success: false, message: "La tarea no existe." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: anotacion },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Error al registrar la anotación:",
      error instanceof Error ? error.message : "Error desconocido",
    );

    return NextResponse.json(
      { success: false, message: "No se pudo registrar la anotación." },
      { status: 500 },
    );
  }
}
