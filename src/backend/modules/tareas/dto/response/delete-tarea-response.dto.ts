export type DeleteTareaResponseDto = {
  IdTarea: number;
  FechaEliminacion: Date;
};

export type DeleteTareaResult =
  | DeleteTareaResponseDto
  | "FORBIDDEN"
  | "ALREADY_DELETED"
  | null;
