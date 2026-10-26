import { Injectable, signal } from '@angular/core';
import { guardarJson, leerJson } from '../data/local/almacenamiento';

export interface Ajustes {
  /** Notificación diaria con resumen de disponibilidad y pendientes. */
  resumenDiario: boolean;
  /** Hora del resumen diario, formato HH:mm */
  horaResumen: string;
  /** Minutos de anticipación con que se avisa cada recordatorio (0 = a la hora exacta). */
  minutosAnticipacion: number;
}

const CLAVE = 'ajustes';
const POR_DEFECTO: Ajustes = { resumenDiario: true, horaResumen: '08:00', minutosAnticipacion: 15 };

/** Preferencias del usuario. Se guardan solo en el celular (no van al backend). */
@Injectable({ providedIn: 'root' })
export class AjustesService {
  readonly ajustes = signal<Ajustes>(POR_DEFECTO);

  async cargar(): Promise<Ajustes> {
    const guardados = await leerJson<Ajustes>(CLAVE);
    this.ajustes.set({ ...POR_DEFECTO, ...(guardados ?? {}) });
    return this.ajustes();
  }

  async guardar(cambios: Partial<Ajustes>): Promise<Ajustes> {
    const nuevos = { ...this.ajustes(), ...cambios };
    this.ajustes.set(nuevos);
    await guardarJson(CLAVE, nuevos);
    return nuevos;
  }
}
