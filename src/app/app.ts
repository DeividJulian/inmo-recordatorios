import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';
import { registrarIconos } from './shared/iconos';
import { AjustesService } from './core/services/ajustes.service';
import { RecordatoriosService } from './core/services/recordatorios.service';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet />
    </ion-app>
  `,
})
export class App implements OnInit {
  private router = inject(Router);
  private ajustes = inject(AjustesService);
  private recordatorios = inject(RecordatoriosService);

  constructor() {
    registrarIconos();
  }

  async ngOnInit() {
    await this.ajustes.cargar();
    // Vuelve a programar las notificaciones con los datos guardados
    await this.recordatorios.sincronizarNotificaciones();

    // Al tocar una notificación, abre el recordatorio correspondiente
    LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
      const extra = notification.extra ?? {};
      if (extra.recordatorioId) {
        this.router.navigateByUrl(`/recordatorio/${extra.recordatorioId}`);
      } else if (extra.ruta) {
        this.router.navigateByUrl(extra.ruta);
      }
    }).catch(() => undefined);
  }
}
