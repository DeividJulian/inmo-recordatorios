/**
 * Modelo de Inmueble.
 * IMPORTANTE: cuando el cliente entregue la base de datos, ajusta estos campos
 * para que coincidan con las columnas reales (o crea un "mapper" en el repositorio HTTP).
 */

export type TipoInmueble = 'departamento' | 'casa' | 'lote' | 'local' | 'oficina' | 'bodega';

export type OperacionInmueble = 'venta' | 'arriendo';

export type EstadoInmueble = 'disponible' | 'reservado' | 'vendido' | 'arrendado';

export interface Inmueble {
  id: string;
  codigo: string;              // Código interno de la inmobiliaria (ej. DEP-001)
  titulo: string;
  tipo: TipoInmueble;
  operacion: OperacionInmueble;
  estado: EstadoInmueble;
  precio: number;              // En pesos colombianos (COP)
  ciudad: string;
  direccion: string;
  area: number;                // m²
  habitaciones?: number | null;
  banos?: number | null;
  propietario: string;
  telefonoPropietario: string;
  fechaDisponible?: string | null; // ISO (YYYY-MM-DD...) — cuándo queda libre si hoy no lo está
  notas?: string;
  actualizadoEn: string;       // ISO
}

/** Datos que se envían al crear (sin id ni fecha de actualización). */
export type InmuebleNuevo = Omit<Inmueble, 'id' | 'actualizadoEn'>;
