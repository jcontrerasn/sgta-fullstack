export type ListTareaResponseDto = {
  IdTarea: number;
  Titulo: string;
  Descripcion: string;
  FechaVencimiento: string;
  UsuarioCreador: string;
  Involucrados: string[];
  FechaCreacion: Date;
  FechaModificacion: Date | null;
  FechaCierre: Date | null;
  FechaEliminacion: Date | null;
  IdUsuarioEliminacion: number | null;
};
