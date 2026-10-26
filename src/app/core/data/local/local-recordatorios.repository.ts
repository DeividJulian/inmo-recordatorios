import { Injectable } from '@angular/core';
import { RecordatoriosRepository } from '../recordatorios.repository';
import { Recordatorio, RecordatorioNuevo } from '../../models/recordatorio.model';
import { crearRecordatoriosPrueba } from './datos-prueba';
import { generarId, guardarJson, leerJson } from './almacenamiento';

const CLAVE = 'recordatorios';

@Injectable()
export class LocalRecordatoriosRepository extends RecordatoriosRepository {
  private async todos(): Promise<Recordatorio[]> {
    let lista = await leerJson<Recordatorio[]>(CLAVE);
    if (!lista) {
      lista = crearRecordatoriosPrueba();
      await guardarJson(CLAVE, lista);
    }
    return lista;
  }

  async listar(): Promise<Recordatorio[]> {
    const lista = await this.todos();
    return [...lista].sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  }

  async listarPorInmueble(inmuebleId: string): Promise<Recordatorio[]> {
    return (await this.listar()).filter((r) => r.inmuebleId === inmuebleId);
  }

  async obtener(id: string): Promise<Recordatorio | undefined> {
    return (await this.todos()).find((r) => r.id === id);
  }

  async crear(datos: RecordatorioNuevo): Promise<Recordatorio> {
    const lista = await this.todos();
    const nuevo: Recordatorio = {
      ...datos,
      id: generarId(),
      notificacionId: null,
      creadoEn: new Date().toISOString(),
    };
    lista.push(nuevo);
    await guardarJson(CLAVE, lista);
    return nuevo;
  }

  async actualizar(id: string, cambios: Partial<Recordatorio>): Promise<Recordatorio> {
    const lista = await this.todos();
    const idx = lista.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Recordatorio no encontrado');
    lista[idx] = { ...lista[idx], ...cambios, id };
    await guardarJson(CLAVE, lista);
    return lista[idx];
  }

  async eliminar(id: string): Promise<void> {
    const lista = await this.todos();
    await guardarJson(CLAVE, lista.filter((r) => r.id !== id));
  }
}
