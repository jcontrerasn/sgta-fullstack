export type UpdateTareaResponseDto = {
  IdTarea: number;
  Titulo: string;
  Descripcion: string;
  FechaVencimiento: string;
  UsuarioCreador: string;
  Involucrados: string[];
  FechaCreacion: Date;
  FechaModificacion: Date | null;
};

export type UpdateTareaResult = UpdateTareaResponseDto | "FORBIDDEN" | null;
