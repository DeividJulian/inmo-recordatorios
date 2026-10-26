import { Preferences } from '@capacitor/preferences';

/**
 * Pequeño ayudante para guardar JSON en el dispositivo.
 * En el navegador usa localStorage; en Android/iOS usa el almacenamiento nativo.
 */
export async function leerJson<T>(clave: string): Promise<T | null> {
  const { value } = await Preferences.get({ key: clave });
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function guardarJson<T>(clave: string, valor: T): Promise<void> {
  await Preferences.set({ key: clave, value: JSON.stringify(valor) });
}

export async function borrarClave(clave: string): Promise<void> {
  await Preferences.remove({ key: clave });
}

export function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
