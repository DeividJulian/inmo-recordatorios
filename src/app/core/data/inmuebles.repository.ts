import { Inmueble, InmuebleNuevo } from '../models/inmueble.model';

/**
 * Contrato (interfaz) del acceso a datos de inmuebles.
 *
 * Las pantallas SOLO dependen de esta clase abstracta. Hoy se usa
 * LocalInmueblesRepository (datos de prueba guardados en el celular).
 * Cuando exista el backend, creas HttpInmueblesRepository que extienda
 * esta clase y cambias UNA línea en app.config.ts.
 */
export abstract class InmueblesRepository {
  abstract listar(): Promise<Inmueble[]>;
  abstract obtener(id: string): Promise<Inmueble | undefined>;
  abstract crear(datos: InmuebleNuevo): Promise<Inmueble>;
  abstract actualizar(id: string, cambios: Partial<InmuebleNuevo>): Promise<Inmueble>;
  abstract eliminar(id: string): Promise<void>;
}
