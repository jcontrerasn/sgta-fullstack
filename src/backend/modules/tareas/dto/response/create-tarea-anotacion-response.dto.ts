export type CreateTareaAnotacionResponseDto = {
  IdAnotacion: number;
  IdTarea: number;
  UsuarioAutor: string;
  Comentario: string;
  EsComentarioCierre: boolean;
  FechaCreacion: Date;
};
