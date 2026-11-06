export type CreateTareaRequestDto = {
  Titulo: string;
  Descripcion: string;
  FechaVencimiento: string;
  UsuarioCreador: string;
  Involucrados: string[];
};
