import { Component, inject, signal } from '@angular/core';
import {
  AlertController, ToastController, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader,
  IonItem, IonLabel, IonToggle, IonInput, IonSelect, IonSelectOption, IonIcon, IonButton, IonNote,
} from '@ionic/angular';
import { AjustesService } from '../../core/services/ajustes.service';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { RecordatoriosService } from '../../core/services/recordatorios.service';
import { borrarClave } from '../../core/data/local/almacenamiento';

@Component({
  selector: 'app-ajustes',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonToggle,
    IonInput, IonSelect, IonSelectOption, IonIcon, IonButton, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Ajustes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-list-header><ion-label>Notificaciones</ion-label></ion-list-header>
        <ion-item>
          <ion-icon slot="start" name="notifications-outline" [color]="permiso() ? 'success' : 'danger'" />
          <ion-label>
            <h3>Permiso de notificaciones</h3>
            <p>{{ permiso() ? 'Concedido' : 'No concedido' }}</p>
          </ion-label>
          @if (!permiso()) {
            <ion-button slot="end" size="small" (click)="pedirPermiso()">Permitir</ion-button>
          }
        </ion-item>
        @if (!alarmasExactas()) {
          <ion-item>
            <ion-icon slot="start" name="alarm-outline" color="warning" />
            <ion-label class="ion-text-wrap">
              <h3>Alarmas exactas desactivadas</h3>
              <p>Los avisos pueden llegar con retraso.</p>
            </ion-label>
            <ion-button slot="end" size="small" (click)="abrirAlarmasExactas()">Activar</ion-button>
          </ion-item>
        }
        <ion-item>
          <ion-select
            label="Avisar antes de cada recordatorio"
            interface="popover"
            [value]="ajustes().minutosAnticipacion"
            (ionChange)="cambiar({ minutosAnticipacion: +$event.detail.value })"
          >
            @for (m of anticipaciones; track m.valor) {
              <ion-select-option [value]="m.valor">{{ m.texto }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-toggle [checked]="ajustes().resumenDiario" (ionChange)="cambiar({ resumenDiario: $event.detail.checked })">
            <ion-label>
              <h3>Resumen diario</h3>
              <p>Disponibles, pendientes de hoy y vencidos</p>
            </ion-label>
          </ion-toggle>
        </ion-item>
        @if (ajustes().resumenDiario) {
          <ion-item>
            <ion-input
              label="Hora del resumen"
              type="time"
              [value]="ajustes().horaResumen"
              (ionChange)="cambiarHora($event.detail.value)"
            />
          </ion-item>
        }
        <ion-item [button]="true" [detail]="false" (click)="probar()">
          <ion-icon slot="start" name="notifications-outline" color="primary" />
          <ion-label>Enviar notificación de prueba (5 s)</ion-label>
        </ion-item>
        <ion-item [button]="true" [detail]="false" (click)="reprogramar()">
          <ion-icon slot="start" name="refresh-outline" color="primary" />
          <ion-label>Reprogramar todas las notificaciones</ion-label>
        </ion-item>

        <ion-list-header><ion-label>Datos</ion-label></ion-list-header>
        <ion-item [button]="true" [detail]="false" (click)="confirmarRestablecer()">
          <ion-icon slot="start" name="trash-outline" color="danger" />
          <ion-label color="danger">Restablecer datos de prueba</ion-label>
        </ion-item>
        <ion-item lines="none">
          <ion-icon slot="start" name="information-circle-outline" color="medium" />
          <ion-note class="ion-text-wrap">
            Por ahora los datos se guardan solo en este celular. Cuando exista el backend se sincronizarán con la base de datos de la inmobiliaria.
          </ion-note>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
})
export class AjustesPage {
  private ajustesService = inject(AjustesService);
  private notis = inject(NotificacionesService);
  private recService = inject(RecordatoriosService);
  private alertas = inject(AlertController);
  private toasts = inject(ToastController);

  readonly ajustes = this.ajustesService.ajustes;
  readonly anticipaciones = [
    { valor: 0, texto: 'A la hora exacta' },
    { valor: 5, texto: '5 minutos' },
    { valor: 15, texto: '15 minutos' },
    { valor: 30, texto: '30 minutos' },
    { valor: 60, texto: '1 hora' },
    { valor: 1440, texto: '1 día' },
  ];

  permiso = signal(false);
  alarmasExactas = signal(true);

  async ionViewWillEnter() {
    this.permiso.set(await this.notis.tienePermiso());
    this.alarmasExactas.set(await this.notis.alarmasExactasActivas());
  }

  async pedirPermiso() {
    this.permiso.set(await this.notis.pedirPermiso());
    if (this.permiso()) await this.recService.sincronizarNotificaciones();
  }

  async abrirAlarmasExactas() {
    await this.notis.abrirAjusteAlarmasExactas();
    this.alarmasExactas.set(await this.notis.alarmasExactasActivas());
  }

  async cambiar(cambios: Parameters<AjustesService['guardar']>[0]) {
    await this.ajustesService.guardar(cambios);
    await this.recService.sincronizarNotificaciones();
  }

  async cambiarHora(valor: string | null | undefined) {
    if (valor) await this.cambiar({ horaResumen: valor.slice(0, 5) });
  }

  async probar() {
    const ok = await this.notis.probar(5);
    this.permiso.set(await this.notis.tienePermiso());
    await this.avisar(ok ? 'Llegará en 5 segundos. Minimiza la app para verla.' : 'Primero concede el permiso de notificaciones.');
  }

  async reprogramar() {
    await this.recService.sincronizarNotificaciones();
    await this.avisar('Notificaciones reprogramadas.');
  }

  async confirmarRestablecer() {
    const alerta = await this.alertas.create({
      header: 'Restablecer datos',
      message: 'Se borrarán los inmuebles y recordatorios guardados en este celular y se cargarán los datos de prueba.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Restablecer',
          role: 'destructive',
          handler: async () => {
            await borrarClave('inmuebles');
            await borrarClave('recordatorios');
            await this.recService.sincronizarNotificaciones();
            await this.avisar('Datos de prueba restablecidos.');
          },
        },
      ],
    });
    await alerta.present();
  }

  private async avisar(message: string) {
    const toast = await this.toasts.create({ message, duration: 1800, position: 'bottom' });
    await toast.present();
  }
}
