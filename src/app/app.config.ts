import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, RouteReuseStrategy, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { routes } from './app.routes';
import { InmueblesRepository } from './core/data/inmuebles.repository';
import { RecordatoriosRepository } from './core/data/recordatorios.repository';
import { LocalInmueblesRepository } from './core/data/local/local-inmuebles.repository';
import { LocalRecordatoriosRepository } from './core/data/local/local-recordatorios.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideIonicAngular({ mode: 'md' }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideRouter(routes, withPreloading(PreloadAllModules)),
    { provide: LOCALE_ID, useValue: 'es-CO' },

    // ===== Capa de datos =====
    // HOY: datos de prueba guardados en el celular.
    // CUANDO EXISTA EL BACKEND: cambia useClass por HttpInmueblesRepository / HttpRecordatoriosRepository.
    { provide: InmueblesRepository, useClass: LocalInmueblesRepository },
    { provide: RecordatoriosRepository, useClass: LocalRecordatoriosRepository },
  ],
};
