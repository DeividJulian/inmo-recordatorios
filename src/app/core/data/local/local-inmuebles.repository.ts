import { Injectable } from '@angular/core';
import { InmueblesRepository } from '../inmuebles.repository';
import { Inmueble, InmuebleNuevo } from '../../models/inmueble.model';
import { crearInmueblesPrueba } from './datos-prueba';
import { generarId, guardarJson, leerJson } from './almacenamiento';

const CLAVE = 'inmuebles';

/**
 * Implementación TEMPORAL: guarda los inmuebles en el dispositivo.
 * Se reemplaza por HttpInmueblesRepository cuando tengamos backend.
 */
@Injectable()
export class LocalInmueblesRepository extends InmueblesRepository {
  private async todos(): Promise<Inmueble[]> {
    let lista = await leerJson<Inmueble[]>(CLAVE);
    if (!lista) {
      lista = crearInmueblesPrueba();
      await guardarJson(CLAVE, lista);
    }
    return lista;
  }

  async listar(): Promise<Inmueble[]> {
    const lista = await this.todos();
    return [...lista].sort((a, b) => a.codigo.localeCompare(b.codigo));
  }

  async obtener(id: string): Promise<Inmueble | undefined> {
    return (await this.todos()).find((i) => i.id === id);
  }

  async crear(datos: InmuebleNuevo): Promise<Inmueble> {
    const lista = await this.todos();
    const nuevo: Inmueble = { ...datos, id: generarId(), actualizadoEn: new Date().toISOString() };
    lista.push(nuevo);
    await guardarJson(CLAVE, lista);
    return nuevo;
  }

  async actualizar(id: string, cambios: Partial<InmuebleNuevo>): Promise<Inmueble> {
    const lista = await this.todos();
    const idx = lista.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Inmueble no encontrado');
    lista[idx] = { ...lista[idx], ...cambios, actualizadoEn: new Date().toISOString() };
    await guardarJson(CLAVE, lista);
    return lista[idx];
  }

  async eliminar(id: string): Promise<void> {
    const lista = await this.todos();
    await guardarJson(CLAVE, lista.filter((i) => i.id !== id));
  }
}
