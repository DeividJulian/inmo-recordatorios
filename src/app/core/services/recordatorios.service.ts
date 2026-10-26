import { inject, Injectable } from '@angular/core';
import { RecordatoriosRepository } from '../data/recordatorios.repository';
import { InmueblesRepository } from '../data/inmuebles.repository';
import { Recordatorio, RecordatorioNuevo } from '../models/recordatorio.model';
import { ID_RESUMEN_DIARIO, NotificacionesService } from './notificaciones.service';
import { AjustesService } from './ajustes.service';
import { esHoy, estaVencido } from '../../shared/fechas';

/**
 * Lógica de negocio de recordatorios: guarda en el repositorio y
 * mantiene sincronizadas las notificaciones del celular.
 * Las pantallas usan este servicio (no el plugin directamente).
 */
@Injectable({ providedIn: 'root' })
export class RecordatoriosService {
  private repo = inject(RecordatoriosRepository);
  private inmuebles = inject(InmueblesRepository);
  private notis = inject(NotificacionesService);
  private ajustes = inject(AjustesService);

  listar() {
    return this.repo.listar();
  }

  listarPorInmueble(inmuebleId: string) {
    return this.repo.listarPorInmueble(inmuebleId);
  }

  obtener(id: string) {
    return this.repo.obtener(id);
  }

  /** Crea o actualiza y (re)programa la notificación. */
  async guardar(datos: RecordatorioNuevo, id?: string): Promise<Recordatorio> {
    if (datos.notificar && !(await this.notis.tienePermiso())) {
      await this.notis.pedirPermiso();
    }
    const rec = id ? await this.repo.actualizar(id, datos) : await this.repo.crear(datos);
    const notificacionId = await this.notis.programar(rec, this.ajustes.ajustes().minutosAnticipacion);
    const final = await this.repo.actualizar(rec.id, { notificacionId });
    await this.actualizarResumenDiario();
    return final;
  }

  async marcarCompletado(rec: Recordatorio, completado: boolean): Promise<Recordatorio> {
    const actualizado = await this.repo.actualizar(rec.id, { completado });
    const notificacionId = await this.notis.programar(actualizado, this.ajustes.ajustes().minutosAnticipacion);
    await this.actualizarResumenDiario();
    return this.repo.actualizar(rec.id, { notificacionId });
  }

  async eliminar(rec: Recordatorio): Promise<void> {
    await this.notis.cancelar(this.notis.idNumerico(rec.id));
    await this.repo.eliminar(rec.id);
    await this.actualizarResumenDiario();
  }

  /**
   * Reprograma TODAS las notificaciones a partir de los datos guardados.
   * Se llama al abrir la app y al cambiar los ajustes.
   */
  async sincronizarNotificaciones(): Promise<void> {
    await this.notis.cancelarTodas();
    const minutos = this.ajustes.ajustes().minutosAnticipacion;
    const lista = await this.repo.listar();
    for (const rec of lista) {
      if (rec.notificar && !rec.completado && !estaVencido(rec.fechaHora)) {
        await this.notis.programar(rec, minutos);
      }
    }
    await this.actualizarResumenDiario();
  }

  /** Rearma el texto del resumen diario con los números actuales. */
  async actualizarResumenDiario(): Promise<void> {
    const { resumenDiario, horaResumen } = this.ajustes.ajustes();
    if (!resumenDiario) {
      await this.notis.cancelar(ID_RESUMEN_DIARIO);
      return;
    }
    const [recs, inms] = await Promise.all([this.repo.listar(), this.inmuebles.listar()]);
    const pendientes = recs.filter((r) => !r.completado);
    const hoy = pendientes.filter((r) => esHoy(r.fechaHora)).length;
    const vencidos = pendientes.filter((r) => estaVencido(r.fechaHora) && !esHoy(r.fechaHora)).length;
    const disponibles = inms.filter((i) => i.estado === 'disponible').length;
    const texto =
      `${disponibles} inmuebles disponibles · ${hoy} recordatorios para hoy` +
      (vencidos ? ` · ${vencidos} vencidos` : '');
    await this.notis.programarResumenDiario(horaResumen, texto);
  }
}
