import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Recordatorio } from '../models/recordatorio.model';
import { tipoRecordatorio } from '../../shared/etiquetas';

/** Id fijo reservado para la notificación de resumen diario. */
export const ID_RESUMEN_DIARIO = 1;

/** Id fijo reservado para la notificación de prueba. */
export const ID_PRUEBA = 2;

/**
 * Envuelve el plugin @capacitor/local-notifications.
 * Funciona en Android/iOS y, para pruebas, también en el navegador
 * (mientras la pestaña esté abierta).
 */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  /** Convierte el id de texto del recordatorio en un número estable (lo exige el plugin). */
  idNumerico(idTexto: string): number {
    let hash = 0;
    for (let i = 0; i < idTexto.length; i++) {
      hash = (hash * 31 + idTexto.charCodeAt(i)) | 0;
    }
    return (Math.abs(hash) % 2_000_000_000) + 1000; // >= 1000 para no chocar con ids reservados
  }

  async tienePermiso(): Promise<boolean> {
    try {
      const { display } = await LocalNotifications.checkPermissions();
      return display === 'granted';
    } catch {
      return false;
    }
  }

  async pedirPermiso(): Promise<boolean> {
    try {
      const { display } = await LocalNotifications.requestPermissions();
      return display === 'granted';
    } catch {
      return false;
    }
  }

  /** Android 12+: las alarmas exactas pueden estar desactivadas. */
  async alarmasExactasActivas(): Promise<boolean> {
    if (Capacitor.getPlatform() !== 'android') return true;
    try {
      const { exact_alarm } = await LocalNotifications.checkExactNotificationSetting();
      return exact_alarm === 'granted';
    } catch {
      return true;
    }
  }

  async abrirAjusteAlarmasExactas(): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') return;
    await LocalNotifications.changeExactNotificationSetting();
  }

  /** Programa (o reprograma) la notificación de un recordatorio. */
  async programar(rec: Recordatorio, minutosAnticipacion: number): Promise<number | null> {
    const id = this.idNumerico(rec.id);
    await this.cancelar(id);

    if (!rec.notificar || rec.completado) return null;

    const cuando = new Date(new Date(rec.fechaHora).getTime() - minutosAnticipacion * 60_000);
    if (cuando.getTime() <= Date.now()) return null; // ya pasó: no se programa

    if (!(await this.tienePermiso())) return null;

    const tipo = tipoRecordatorio(rec.tipo).texto;
    const hora = new Date(rec.fechaHora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const notificacion: LocalNotificationSchema = {
      id,
      title: `${tipo}: ${rec.titulo}`,
      body: minutosAnticipacion > 0
        ? `En ${minutosAnticipacion} min (${hora}). ${rec.descripcion ?? ''}`.trim()
        : `${hora}. ${rec.descripcion ?? ''}`.trim(),
      schedule: { at: cuando, allowWhileIdle: true },
      extra: { recordatorioId: rec.id },
    };
    await LocalNotifications.schedule({ notifications: [notificacion] });
    return id;
  }

  async cancelar(id: number | null | undefined): Promise<void> {
    if (!id) return;
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch {
      /* no estaba programada */
    }
  }

  /** Cancela todas las notificaciones pendientes. */
  async cancelarTodas(): Promise<void> {
    try {
      const { notifications } = await LocalNotifications.getPending();
      if (notifications.length) {
        await LocalNotifications.cancel({ notifications: notifications.map((n) => ({ id: n.id })) });
      }
    } catch {
      /* sin soporte */
    }
  }

  /** Lanza una notificación de prueba dentro de unos segundos. */
  async probar(segundos = 5): Promise<boolean> {
    if (!(await this.tienePermiso()) && !(await this.pedirPermiso())) return false;
    await LocalNotifications.schedule({
      notifications: [{
        id: ID_PRUEBA,
        title: 'Notificación de prueba',
        body: 'Si ves esto, los recordatorios funcionan en este celular.',
        schedule: { at: new Date(Date.now() + segundos * 1000), allowWhileIdle: true },
      }],
    });
    return true;
  }

  /** Notificación que se repite cada día a la hora indicada (HH:mm). */
  async programarResumenDiario(hora: string, texto: string): Promise<void> {
    await this.cancelar(ID_RESUMEN_DIARIO);
    if (!(await this.tienePermiso())) return;
    const [h, m] = hora.split(':').map(Number);
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: ID_RESUMEN_DIARIO,
          title: 'Resumen del día',
          body: texto,
          schedule: { on: { hour: h, minute: m }, allowWhileIdle: true },
          extra: { ruta: '/tabs/inicio' },
        }],
      });
    } catch (e) {
      // En el navegador las notificaciones repetitivas no están soportadas.
      console.warn('Resumen diario no disponible en esta plataforma', e);
    }
  }
}
