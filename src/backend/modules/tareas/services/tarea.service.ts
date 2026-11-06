import "server-only";

import type { CreateTareaAnotacionRequestDto } from
  "../dto/request/create-tarea-anotacion-request.dto";
import type { CreateTareaRequestDto } from "../dto/request/create-tarea-request.dto";
import type { DeleteTareaRequestDto } from
  "../dto/request/delete-tarea-request.dto";
import type { UpdateTareaRequestDto } from
  "../dto/request/update-tarea-request.dto";
import {
  createTareaAnotacion,
  createTarea,
  deleteTarea,
  findTareaAnotaciones,
  findAllTareas,
  updateTarea,
} from "../repositories/tarea.repository";

export async function getAllTareas() {
  return findAllTareas();
}

export async function registerTarea(input: CreateTareaRequestDto) {
  return createTarea(input);
}

export async function registerTareaAnotacion(
  idTarea: number,
  input: CreateTareaAnotacionRequestDto,
) {
  return createTareaAnotacion(idTarea, input);
}

export async function getTareaAnotaciones(idTarea: number) {
  return findTareaAnotaciones(idTarea);
}

export async function modifyTarea(
  idTarea: number,
  input: UpdateTareaRequestDto,
) {
  return updateTarea(idTarea, input);
}

export async function removeTarea(
  idTarea: number,
  input: DeleteTareaRequestDto,
) {
  return deleteTarea(idTarea, input);
}
