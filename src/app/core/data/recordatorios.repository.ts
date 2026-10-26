import { Recordatorio, RecordatorioNuevo } from '../models/recordatorio.model';

/**
 * Contrato del acceso a datos de recordatorios.
 * Igual que con inmuebles: hoy es local, mañana HTTP.
 */
export abstract class RecordatoriosRepository {
  abstract listar(): Promise<Recordatorio[]>;
  abstract listarPorInmueble(inmuebleId: string): Promise<Recordatorio[]>;
  abstract obtener(id: string): Promise<Recordatorio | undefined>;
  abstract crear(datos: RecordatorioNuevo): Promise<Recordatorio>;
  abstract actualizar(id: string, cambios: Partial<Recordatorio>): Promise<Recordatorio>;
  abstract eliminar(id: string): Promise<void>;
}
