import { EstadoInmueble, OperacionInmueble, TipoInmueble } from '../core/models/inmueble.model';
import { TipoRecordatorio } from '../core/models/recordatorio.model';

/** Textos y colores para mostrar en pantalla. */

export const TIPOS_INMUEBLE: { valor: TipoInmueble; texto: string; icono: string }[] = [
  { valor: 'departamento', texto: 'Departamento', icono: 'business-outline' },
  { valor: 'casa', texto: 'Casa', icono: 'home-outline' },
  { valor: 'lote', texto: 'Lote', icono: 'map-outline' },
  { valor: 'local', texto: 'Local', icono: 'storefront-outline' },
  { valor: 'oficina', texto: 'Oficina', icono: 'briefcase-outline' },
  { valor: 'bodega', texto: 'Bodega', icono: 'cube-outline' },
];

export const ESTADOS_INMUEBLE: { valor: EstadoInmueble; texto: string; color: string }[] = [
  { valor: 'disponible', texto: 'Disponible', color: 'success' },
  { valor: 'reservado', texto: 'Reservado', color: 'warning' },
  { valor: 'arrendado', texto: 'Arrendado', color: 'tertiary' },
  { valor: 'vendido', texto: 'Vendido', color: 'medium' },
];

export const OPERACIONES: { valor: OperacionInmueble; texto: string }[] = [
  { valor: 'venta', texto: 'Venta' },
  { valor: 'arriendo', texto: 'Arriendo' },
];

export const TIPOS_RECORDATORIO: { valor: TipoRecordatorio; texto: string; icono: string; color: string }[] = [
  { valor: 'disponibilidad', texto: 'Disponibilidad', icono: 'key-outline', color: 'success' },
  { valor: 'visita', texto: 'Visita', icono: 'walk-outline', color: 'primary' },
  { valor: 'seguimiento', texto: 'Seguimiento', icono: 'call-outline', color: 'secondary' },
  { valor: 'pago', texto: 'Pago', icono: 'cash-outline', color: 'warning' },
  { valor: 'documento', texto: 'Documento', icono: 'document-text-outline', color: 'tertiary' },
  { valor: 'otro', texto: 'Otro', icono: 'bookmark-outline', color: 'medium' },
];

export const tipoInmueble = (v: TipoInmueble) => TIPOS_INMUEBLE.find((t) => t.valor === v)!;
export const estadoInmueble = (v: EstadoInmueble) => ESTADOS_INMUEBLE.find((e) => e.valor === v)!;
export const tipoRecordatorio = (v: TipoRecordatorio) => TIPOS_RECORDATORIO.find((t) => t.valor === v)!;
