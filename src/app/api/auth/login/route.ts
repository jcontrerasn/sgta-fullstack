import { NextResponse } from "next/server";
import { getUserProfile } from "@/backend/modules/auth/services/auth.service";
import type { LoginRequestDto } from "@/backend/modules/auth/dto/request/login-request.dto";
import { loginSchema } from "@/shared/schemas/login.schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "El usuario es obligatorio" },
        { status: 400 },
      );
    }

    const loginRequest: LoginRequestDto = parsed.data;
    const user = await getUserProfile(loginRequest.usuario);

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
      "Error al consultar usuario:",
      error instanceof Error ? error.message : "Error desconocido",
    );

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
