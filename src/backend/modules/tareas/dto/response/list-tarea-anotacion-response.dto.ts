export type ListTareaAnotacionResponseDto = {
  IdAnotacion: number;
  IdTarea: number;
  UsuarioAutor: string;
  Comentario: string;
  EsComentarioCierre: boolean;
  FechaCreacion: Date;
};
