/** Utilidades de fecha (todas en hora local del celular). */

const dos = (n: number) => n.toString().padStart(2, '0');

/** Date -> "2026-10-26T15:30" (formato de los inputs datetime-local) */
export function aIsoLocal(d: Date): string {
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

/** Fecha y hora redondeada a la próxima hora en punto. */
export function proximaHora(): string {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return aIsoLocal(d);
}

export function esHoy(iso: string): boolean {
  const d = new Date(iso);
  const h = new Date();
  return d.getFullYear() === h.getFullYear() && d.getMonth() === h.getMonth() && d.getDate() === h.getDate();
}

export function estaVencido(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

/** Días que faltan (negativo si ya pasó). Compara solo fechas, no horas. */
export function diasHasta(iso: string): number {
  const d = new Date(iso);
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const h = new Date();
  const b = new Date(h.getFullYear(), h.getMonth(), h.getDate()).getTime();
  return Math.round((a - b) / 86_400_000);
}
