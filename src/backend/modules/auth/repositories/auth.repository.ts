import "server-only";
import sql from "mssql";
import { getExternalPool } from "@/backend/database/external/external-db";
import type { LoginResponseDto } from "../dto/response/login-response.dto";
import type { ListUserResponseDto } from "../dto/response/list-user-response.dto";
import type { SearchUserByFullNameResponseDto } from "../dto/response/search-user-by-full-name-response.dto";

type UserByAccountRow = {
  Usuario: string;
  Area: string;
  NombreCompleto: string;
  "Ubicación": string;
  Telefono: string;
  ContactoArea: string;
  Correo: string;
  TelefonoContactoArea: string;
};

export async function findUserByUsername(
  usuario: string,
): Promise<LoginResponseDto | null> {
  const pool = await getExternalPool();

  const result = await pool
    .request()
    .input("Pcuenta_n", sql.VarChar(100), usuario)
    .execute("dbo.pr_sm_BuscarUsuarioXCuenta");

  const row = result.recordset[0] as UserByAccountRow | undefined;

  if (!row) {
    return null;
  }

  return {
    Usuario: row.Usuario,
    NombreCompleto: row.NombreCompleto,
    Ubicacion: row["Ubicación"],
    Area: row.Area,
    Telefono: row.Telefono,
    ContactoArea: row.ContactoArea,
    Correo: row.Correo,
    TelefonoContactoArea: row.TelefonoContactoArea,
    Rol: null,
  };
}

export async function findUsersByFilter(
  filtro: string,
): Promise<ListUserResponseDto[]> {
  const pool = await getExternalPool();

  const result = await pool
    .request()
    .input("Pfiltro_c", sql.VarChar(50), filtro)
    .execute("dbo.pr_sm_ListarUsuarioXFiltro");

  return result.recordset.map((row) => {
    const user = row as {
      Usuario: string;
      NombreCompleto: string;
      Area: string;
    };

    return {
      Usuario: user.Usuario,
      NombreCompleto: user.NombreCompleto,
      Area: user.Area,
    };
  });
}

export async function findUserByFullName(
  filtro: string,
): Promise<SearchUserByFullNameResponseDto | null> {
  const pool = await getExternalPool();

  const result = await pool
    .request()
    .input("Pfiltro_c", sql.VarChar(50), filtro)
    .execute("dbo.pr_sm_BuscarUsuarioXNombreCompleto");

  const row = result.recordset[0] as
    | {
        Usuario: string;
        NombreCompleto: string;
        "Ubicación": string;
        Area: string;
        CentroCosto: string;
        Telefono: string;
        ContactoArea: string;
        Correo: string;
        TelefonoContactoArea: string;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    Usuario: row.Usuario,
    NombreCompleto: row.NombreCompleto,
    Ubicacion: row["Ubicación"],
    Area: row.Area,
    CentroCosto: row.CentroCosto,
    Telefono: row.Telefono,
    ContactoArea: row.ContactoArea,
    Correo: row.Correo,
    TelefonoContactoArea: row.TelefonoContactoArea,
  };
}
