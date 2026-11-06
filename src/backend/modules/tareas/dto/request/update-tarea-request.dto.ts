export type UpdateTareaRequestDto = {
  UsuarioEditor: string;
  Titulo: string;
  Descripcion: string;
  FechaVencimiento: string;
  Involucrados: string[];
};
