export type TipoRecordatorio =
  | 'disponibilidad'   // Revisar/avisar que un inmueble queda disponible
  | 'visita'           // Visita agendada con un cliente
  | 'seguimiento'      // Llamar o escribir a un cliente interesado
  | 'pago'             // Cobro de arriendo, cuota, comisión
  | 'documento'        // Escrituras, certificados, contratos
  | 'otro';

export interface Recordatorio {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: TipoRecordatorio;
  fechaHora: string;          // ISO local: 2026-10-26T15:30
  inmuebleId?: string | null; // Inmueble relacionado (opcional)
  cliente?: string;           // Nombre del cliente relacionado (opcional)
  telefonoCliente?: string;
  notificar: boolean;         // Si debe lanzar notificación en el celular
  notificacionId?: number | null; // Id numérico de la notificación local programada
  completado: boolean;
  creadoEn: string;
}

export type RecordatorioNuevo = Omit<Recordatorio, 'id' | 'creadoEn' | 'notificacionId'>;
