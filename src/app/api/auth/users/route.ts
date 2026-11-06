import { NextResponse } from "next/server";

import type { ListUsersRequestDto } from "@/backend/modules/auth/dto/request/list-users-request.dto";
import { listUsersByFilter } from "@/backend/modules/auth/services/auth.service";
import { listUsersSchema } from "@/shared/schemas/list-users.schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = listUsersSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "El filtro es obligatorio" },
        { status: 400 },
      );
    }

    const listUsersRequest: ListUsersRequestDto = parsed.data;
    const users = await listUsersByFilter(listUsersRequest.filtro);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(
      "Error al listar usuarios por filtro:",
      error instanceof Error ? error.message : "Error desconocido",
    );

    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
