import "server-only";
import { findActiveRoleByUsername } from
  "@/backend/modules/roles/repositories/rol.repository";
import {
  findUserByFullName,
  findUserByUsername,
  findUsersByFilter,
} from "../repositories/auth.repository";
import type { LoginResponseDto } from "../dto/response/login-response.dto";
import type { ListUserResponseDto } from "../dto/response/list-user-response.dto";
import type { SearchUserByFullNameResponseDto } from "../dto/response/search-user-by-full-name-response.dto";

export async function getUserProfile(
  usuario: string,
): Promise<LoginResponseDto | null> {
  const profile = await findUserByUsername(usuario);

  if (!profile) {
    return null;
  }

  const rol = await findActiveRoleByUsername(profile.Usuario);

  return {
    ...profile,
    Rol: rol ?? "Usuario",
  };
}

export async function listUsersByFilter(
  filtro: string,
): Promise<ListUserResponseDto[]> {
  return findUsersByFilter(filtro);
}

export async function getUserByFullName(
  filtro: string,
): Promise<SearchUserByFullNameResponseDto | null> {
  return findUserByFullName(filtro);
}
