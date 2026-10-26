import { Inmueble } from '../../models/inmueble.model';
import { Recordatorio } from '../../models/recordatorio.model';
import { aIsoLocal } from '../../../shared/fechas';

/**
 * Datos de prueba para trabajar el front mientras llega la base de datos real.
 * Las fechas se calculan a partir de "hoy" para que la app siempre se vea con
 * recordatorios vencidos, de hoy y próximos.
 */

function enDias(dias: number, hora = 9, minuto = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, minuto, 0, 0);
  return aIsoLocal(d);
}

export function crearInmueblesPrueba(): Inmueble[] {
  const ahora = new Date().toISOString();
  return [
    {
      id: 'inm-1', codigo: 'DEP-101', titulo: 'Departamento Torre Norte 502',
      tipo: 'departamento', operacion: 'venta', estado: 'disponible',
      precio: 320_000_000, ciudad: 'Bogotá', direccion: 'Cra 15 #120-45, Apto 502',
      area: 78, habitaciones: 3, banos: 2,
      propietario: 'Laura Gómez', telefonoPropietario: '3001234567',
      notas: 'Vista exterior, parqueadero cubierto.', actualizadoEn: ahora,
    },
    {
      id: 'inm-2', codigo: 'DEP-102', titulo: 'Departamento Conjunto Los Pinos 304',
      tipo: 'departamento', operacion: 'arriendo', estado: 'arrendado',
      precio: 1_800_000, ciudad: 'Medellín', direccion: 'Cl 10 #43-20, Apto 304',
      area: 62, habitaciones: 2, banos: 2,
      propietario: 'Carlos Ruiz', telefonoPropietario: '3109876543',
      fechaDisponible: enDias(12).slice(0, 10),
      notas: 'El inquilino entrega el inmueble a fin de mes.', actualizadoEn: ahora,
    },
    {
      id: 'inm-3', codigo: 'LOT-201', titulo: 'Lote campestre 1.200 m²',
      tipo: 'lote', operacion: 'venta', estado: 'disponible',
      precio: 185_000_000, ciudad: 'Cali', direccion: 'Vía Pance Km 4',
      area: 1200, habitaciones: null, banos: null,
      propietario: 'Familia Ortiz', telefonoPropietario: '3157654321',
      notas: 'Tiene servicios de agua y luz al pie del lote.', actualizadoEn: ahora,
    },
    {
      id: 'inm-4', codigo: 'CAS-301', titulo: 'Casa dos niveles Barrio Santa Fe',
      tipo: 'casa', operacion: 'venta', estado: 'reservado',
      precio: 450_000_000, ciudad: 'Bogotá', direccion: 'Cl 63 #24-11',
      area: 140, habitaciones: 4, banos: 3,
      propietario: 'Andrés Pérez', telefonoPropietario: '3204567890',
      notas: 'Reservada con separación del 10%. Esperando crédito del comprador.', actualizadoEn: ahora,
    },
    {
      id: 'inm-5', codigo: 'LOC-401', titulo: 'Local comercial esquinero',
      tipo: 'local', operacion: 'arriendo', estado: 'disponible',
      precio: 3_500_000, ciudad: 'Medellín', direccion: 'Cra 70 #44-10',
      area: 55, habitaciones: null, banos: 1,
      propietario: 'Inversiones ABC', telefonoPropietario: '3012223344',
      actualizadoEn: ahora,
    },
    {
      id: 'inm-6', codigo: 'LOT-202', titulo: 'Lote urbano esquinero',
      tipo: 'lote', operacion: 'venta', estado: 'vendido',
      precio: 260_000_000, ciudad: 'Cali', direccion: 'Cl 5 #80-12',
      area: 300, habitaciones: null, banos: null,
      propietario: 'Marta Salazar', telefonoPropietario: '3165558899',
      actualizadoEn: ahora,
    },
    {
      id: 'inm-7', codigo: 'DEP-103', titulo: 'Apartaestudio amoblado Centro',
      tipo: 'departamento', operacion: 'arriendo', estado: 'disponible',
      precio: 1_200_000, ciudad: 'Bogotá', direccion: 'Cra 7 #22-30, Apto 1101',
      area: 35, habitaciones: 1, banos: 1,
      propietario: 'Laura Gómez', telefonoPropietario: '3001234567',
      actualizadoEn: ahora,
    },
    {
      id: 'inm-8', codigo: 'OFI-501', titulo: 'Oficina edificio empresarial',
      tipo: 'oficina', operacion: 'arriendo', estado: 'arrendado',
      precio: 4_200_000, ciudad: 'Medellín', direccion: 'Cl 7 Sur #42-70, Of. 803',
      area: 90, habitaciones: null, banos: 2,
      propietario: 'Grupo Inmobiliario XYZ', telefonoPropietario: '3046667788',
      fechaDisponible: enDias(30).slice(0, 10),
      actualizadoEn: ahora,
    },
  ];
}

export function crearRecordatoriosPrueba(): Recordatorio[] {
  const ahora = new Date().toISOString();
  return [
    {
      id: 'rec-1', titulo: 'Llamar a interesado en DEP-101', tipo: 'seguimiento',
      descripcion: 'Preguntar si ya revisó el crédito con el banco.',
      fechaHora: enDias(-1, 10), inmuebleId: 'inm-1', cliente: 'Jorge Martínez',
      telefonoCliente: '3112345678', notificar: true, completado: false, creadoEn: ahora,
    },
    {
      id: 'rec-2', titulo: 'Visita al lote campestre', tipo: 'visita',
      descripcion: 'Llevar planos y certificado de tradición.',
      fechaHora: enDias(0, 16, 30), inmuebleId: 'inm-3', cliente: 'Sofía Herrera',
      telefonoCliente: '3187776655', notificar: true, completado: false, creadoEn: ahora,
    },
    {
      id: 'rec-3', titulo: 'DEP-102 queda disponible', tipo: 'disponibilidad',
      descripcion: 'Publicar de nuevo el apartamento y avisar a la lista de interesados.',
      fechaHora: enDias(12, 8), inmuebleId: 'inm-2', notificar: true, completado: false, creadoEn: ahora,
    },
    {
      id: 'rec-4', titulo: 'Cobrar arriendo oficina OFI-501', tipo: 'pago',
      fechaHora: enDias(3, 9), inmuebleId: 'inm-8', notificar: true, completado: false, creadoEn: ahora,
    },
    {
      id: 'rec-5', titulo: 'Confirmar crédito comprador casa Santa Fe', tipo: 'documento',
      descripcion: 'Si no hay aprobación, liberar la reserva.',
      fechaHora: enDias(1, 11), inmuebleId: 'inm-4', cliente: 'Diana López',
      notificar: true, completado: false, creadoEn: ahora,
    },
    {
      id: 'rec-6', titulo: 'Actualizar fotos del local', tipo: 'otro',
      fechaHora: enDias(-3, 15), inmuebleId: 'inm-5', notificar: false, completado: true, creadoEn: ahora,
    },
  ];
}
