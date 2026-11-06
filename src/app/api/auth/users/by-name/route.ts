import { NextResponse } from "next/server";

import type { SearchUserByFullNameRequestDto } from "@/backend/modules/auth/dto/request/search-user-by-full-name-request.dto";
import { getUserByFullName } from "@/backend/modules/auth/services/auth.service";
import { searchUserByFullNameSchema } from "@/shared/schemas/search-user-by-full-name.schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = searchUserByFullNameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "El filtro es obligatorio" },
        { status: 400 },
      );
    }

    const searchRequest: SearchUserByFullNameRequestDto = parsed.data;
    const user = await getUserByFullName(searchRequest.Pfiltro_c);

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(
      "Error al buscar usuario por nombre completo:",
      error instanceof Error ? error.message : "Error desconocido",
    );

    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
