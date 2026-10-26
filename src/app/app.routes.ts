import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: 'inicio', loadComponent: () => import('./pages/inicio/inicio.page').then((m) => m.InicioPage) },
      { path: 'inmuebles', loadComponent: () => import('./pages/inmuebles/inmuebles.page').then((m) => m.InmueblesPage) },
      { path: 'recordatorios', loadComponent: () => import('./pages/recordatorios/recordatorios.page').then((m) => m.RecordatoriosPage) },
      { path: 'ajustes', loadComponent: () => import('./pages/ajustes/ajustes.page').then((m) => m.AjustesPage) },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
  { path: 'inmueble/nuevo', loadComponent: () => import('./pages/inmueble-form/inmueble-form.page').then((m) => m.InmuebleFormPage) },
  { path: 'inmueble/:id/editar', loadComponent: () => import('./pages/inmueble-form/inmueble-form.page').then((m) => m.InmuebleFormPage) },
  { path: 'inmueble/:id', loadComponent: () => import('./pages/inmueble-detalle/inmueble-detalle.page').then((m) => m.InmuebleDetallePage) },
  { path: 'recordatorio/nuevo', loadComponent: () => import('./pages/recordatorio-form/recordatorio-form.page').then((m) => m.RecordatorioFormPage) },
  { path: 'recordatorio/:id', loadComponent: () => import('./pages/recordatorio-form/recordatorio-form.page').then((m) => m.RecordatorioFormPage) },
  { path: '', redirectTo: 'tabs/inicio', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/inicio' },
];
