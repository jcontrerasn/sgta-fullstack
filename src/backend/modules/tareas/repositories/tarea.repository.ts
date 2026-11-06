import "server-only";

import { getDataSource } from "@/backend/database/typeorm/data-source";
import { IsNull } from "typeorm";
import type { CreateTareaAnotacionRequestDto } from
  "../dto/request/create-tarea-anotacion-request.dto";
import type { CreateTareaRequestDto } from "../dto/request/create-tarea-request.dto";
import type { DeleteTareaRequestDto } from "../dto/request/delete-tarea-request.dto";
import type { UpdateTareaRequestDto } from "../dto/request/update-tarea-request.dto";
import type { CreateTareaAnotacionResponseDto } from
  "../dto/response/create-tarea-anotacion-response.dto";
import type { ListTareaAnotacionResponseDto } from
  "../dto/response/list-tarea-anotacion-response.dto";
import type { CreateTareaResponseDto } from "../dto/response/create-tarea-response.dto";
import type { ListTareaResponseDto } from "../dto/response/list-tarea-response.dto";
import type { DeleteTareaResult } from "../dto/response/delete-tarea-response.dto";
import type { UpdateTareaResult } from "../dto/response/update-tarea-response.dto";
import { TareaAnotacion } from "../entities/tarea-anotaciones.entity";
import { TareaEntity } from "../entities/tarea.entity";
import { TareaInvolucradoEntity } from "../entities/tarea-involucrados.entity";

export async function createTarea(
  input: CreateTareaRequestDto,
): Promise<CreateTareaResponseDto> {
  const dataSource = await getDataSource();

  const involucrados = Array.from(
    new Map(
      input.Involucrados.map((usuario) => {
        const normalizedUsuario = usuario.trim();
        return [normalizedUsuario.toLocaleLowerCase(), normalizedUsuario];
      }),
    ).values(),
  );

  return dataSource.transaction(async (manager) => {
    const tarea = manager.create(TareaEntity, {
      titulo: input.Titulo,
      descripcion: input.Descripcion,
      fechaVencimiento: input.FechaVencimiento,
      usuarioCreador: input.UsuarioCreador,
      fechaModificacion: null,
      fechaCierre: null,
      fechaEliminacion: null,
      idUsuarioEliminacion: null,
    });

    const savedTarea = await manager.save(TareaEntity, tarea);

    if (involucrados.length > 0) {
      const tareaInvolucrados = involucrados.map((usuario) =>
        manager.create(TareaInvolucradoEntity, {
          idTarea: savedTarea.idTarea,
          usuario,
        }),
      );

      await manager.save(TareaInvolucradoEntity, tareaInvolucrados);
    }

    return {
      IdTarea: savedTarea.idTarea,
      Titulo: savedTarea.titulo,
      Descripcion: savedTarea.descripcion,
      FechaVencimiento: savedTarea.fechaVencimiento,
      UsuarioCreador: savedTarea.usuarioCreador,
      Involucrados: involucrados,
      FechaCreacion: savedTarea.fechaCreacion,
    };
  });
}

export async function findAllTareas(): Promise<ListTareaResponseDto[]> {
  const dataSource = await getDataSource();
  const tareas = await dataSource.getRepository(TareaEntity).find({
    where: {
      fechaEliminacion: IsNull(),
    },
    relations: {
      involucrados: true,
    },
    order: {
      idTarea: "ASC",
    },
  });

  return tareas.map((tarea) => ({
    IdTarea: tarea.idTarea,
    Titulo: tarea.titulo,
    Descripcion: tarea.descripcion,
    FechaVencimiento: tarea.fechaVencimiento,
    UsuarioCreador: tarea.usuarioCreador,
    Involucrados: tarea.involucrados.map((involucrado) => involucrado.usuario),
    FechaCreacion: tarea.fechaCreacion,
    FechaModificacion: tarea.fechaModificacion,
    FechaCierre: tarea.fechaCierre,
    FechaEliminacion: tarea.fechaEliminacion,
    IdUsuarioEliminacion: tarea.idUsuarioEliminacion,
  }));
}

export async function createTareaAnotacion(
  idTarea: number,
  input: CreateTareaAnotacionRequestDto,
): Promise<CreateTareaAnotacionResponseDto | null> {
  const dataSource = await getDataSource();
  const tareaRepository = dataSource.getRepository(TareaEntity);
  const anotacionRepository = dataSource.getRepository(TareaAnotacion);
  const tarea = await tareaRepository.findOneBy({ idTarea });

  if (!tarea) {
    return null;
  }

  const anotacion = anotacionRepository.create({
    idTarea,
    usuarioAutor: input.UsuarioAutor,
    comentario: input.Comentario,
    esComentarioCierre: input.EsComentarioCierre,
  });
  const savedAnotacion = await anotacionRepository.save(anotacion);

  return {
    IdAnotacion: savedAnotacion.idAnotacion,
    IdTarea: savedAnotacion.idTarea,
    UsuarioAutor: savedAnotacion.usuarioAutor,
    Comentario: savedAnotacion.comentario,
    EsComentarioCierre: savedAnotacion.esComentarioCierre,
    FechaCreacion: savedAnotacion.fechaCreacion,
  };
}

export async function findTareaAnotaciones(
  idTarea: number,
): Promise<ListTareaAnotacionResponseDto[] | null> {
  const dataSource = await getDataSource();
  const tareaRepository = dataSource.getRepository(TareaEntity);
  const anotacionRepository = dataSource.getRepository(TareaAnotacion);
  const tarea = await tareaRepository.findOneBy({ idTarea });

  if (!tarea) {
    return null;
  }

  const anotaciones = await anotacionRepository.find({
    where: { idTarea },
    order: {
      fechaCreacion: "ASC",
      idAnotacion: "ASC",
    },
  });

  return anotaciones.map((anotacion) => ({
    IdAnotacion: anotacion.idAnotacion,
    IdTarea: anotacion.idTarea,
    UsuarioAutor: anotacion.usuarioAutor,
    Comentario: anotacion.comentario,
    EsComentarioCierre: anotacion.esComentarioCierre,
    FechaCreacion: anotacion.fechaCreacion,
  }));
}

export async function updateTarea(
  idTarea: number,
  input: UpdateTareaRequestDto,
): Promise<UpdateTareaResult> {
  const dataSource = await getDataSource();
  const involucrados = Array.from(
    new Map(
      input.Involucrados.map((usuario) => {
        const normalizedUsuario = usuario.trim();
        return [normalizedUsuario.toLocaleLowerCase(), normalizedUsuario];
      }),
    ).values(),
  );

  return dataSource.transaction(async (manager) => {
    const tarea = await manager.findOne(TareaEntity, {
      where: { idTarea },
    });

    if (!tarea) {
      return null;
    }

    if (
      tarea.usuarioCreador.trim().toLocaleLowerCase() !==
      input.UsuarioEditor.trim().toLocaleLowerCase()
    ) {
      return "FORBIDDEN" as const;
    }

    tarea.titulo = input.Titulo;
    tarea.descripcion = input.Descripcion;
    tarea.fechaVencimiento = input.FechaVencimiento;
    tarea.fechaModificacion = new Date();

    const savedTarea = await manager.save(TareaEntity, tarea);

    await manager.delete(TareaInvolucradoEntity, { idTarea });

    if (involucrados.length > 0) {
      const tareaInvolucrados = involucrados.map((usuario) =>
        manager.create(TareaInvolucradoEntity, {
          idTarea: savedTarea.idTarea,
          usuario,
        }),
      );

      await manager.save(TareaInvolucradoEntity, tareaInvolucrados);
    }

    return {
      IdTarea: savedTarea.idTarea,
      Titulo: savedTarea.titulo,
      Descripcion: savedTarea.descripcion,
      FechaVencimiento: savedTarea.fechaVencimiento,
      UsuarioCreador: savedTarea.usuarioCreador,
      Involucrados: involucrados,
      FechaCreacion: savedTarea.fechaCreacion,
      FechaModificacion: savedTarea.fechaModificacion,
    };
  });
}

export async function deleteTarea(
  idTarea: number,
  input: DeleteTareaRequestDto,
): Promise<DeleteTareaResult> {
  const dataSource = await getDataSource();

  return dataSource.transaction(async (manager) => {
    const tarea = await manager.findOne(TareaEntity, {
      where: { idTarea },
    });

    if (!tarea) {
      return null;
    }

    if (tarea.fechaEliminacion) {
      return "ALREADY_DELETED" as const;
    }

    if (
      tarea.usuarioCreador.trim().toLocaleLowerCase() !==
      input.UsuarioEliminacion.trim().toLocaleLowerCase()
    ) {
      return "FORBIDDEN" as const;
    }

    tarea.fechaEliminacion = new Date();
    const deletedTarea = await manager.save(TareaEntity, tarea);

    return {
      IdTarea: deletedTarea.idTarea,
      FechaEliminacion: deletedTarea.fechaEliminacion as Date,
    };
  });
}
