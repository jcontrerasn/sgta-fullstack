import { NextResponse } from "next/server";

import type { UpdateTareaRequestDto } from
  "@/backend/modules/tareas/dto/request/update-tarea-request.dto";
import type { DeleteTareaRequestDto } from
  "@/backend/modules/tareas/dto/request/delete-tarea-request.dto";
import {
  modifyTarea,
  removeTarea,
} from "@/backend/modules/tareas/services/tarea.service";
import { deleteTareaSchema } from "@/shared/schemas/delete-tarea.schema";
import { updateTareaSchema } from "@/shared/schemas/update-tarea.schema";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idTarea = Number(id);

    if (!Number.isInteger(idTarea) || idTarea < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "El identificador de la tarea no es válido.",
        },
        { status: 400 },
      );
    }

    const body: unknown = await request.json();
    const parsed = deleteTareaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Los datos de eliminación son inválidos.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const deleteRequest: DeleteTareaRequestDto = parsed.data;
    const result = await removeTarea(idTarea, deleteRequest);

    if (result === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Solo el creador puede eliminar esta tarea.",
        },
        { status: 403 },
      );
    }

    if (result === "ALREADY_DELETED") {
      return NextResponse.json(
        { success: false, message: "La tarea ya fue eliminada." },
        { status: 409 },
      );
    }

    if (!result) {
      return NextResponse.json(
        { success: false, message: "La tarea no existe." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(
      "Error al eliminar la tarea:",
      error instanceof Error ? error.message : "Error desconocido",
    );

    return NextResponse.json(
      { success: false, message: "No se pudo eliminar la tarea." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idTarea = Number(id);

    if (!Number.isInteger(idTarea) || idTarea < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "El identificador de la tarea no es válido.",
        },
        { status: 400 },
      );
    }

    const body: unknown = await request.json();
    const parsed = updateTareaSchema.safeParse(body);

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

    const tareaRequest: UpdateTareaRequestDto = parsed.data;
    const tarea = await modifyTarea(idTarea, tareaRequest);

    if (tarea === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Solo el creador puede modificar esta tarea.",
        },
        { status: 403 },
      );
    }

    if (!tarea) {
      return NextResponse.json(
        { success: false, message: "La tarea no existe." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: tarea });
  } catch (error) {
    console.error(
      "Error al actualizar la tarea:",
      error instanceof Error ? error.message : "Error desconocido",
    );

    return NextResponse.json(
      { success: false, message: "No se pudo actualizar la tarea." },
      { status: 500 },
    );
  }
}
