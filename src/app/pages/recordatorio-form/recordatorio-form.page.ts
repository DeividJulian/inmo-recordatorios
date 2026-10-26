import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AlertController, NavController, ToastController, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonBackButton, IonButton, IonContent, IonList, IonItem, IonInput, IonSelect, IonSelectOption,
  IonTextarea, IonToggle, IonIcon, IonLabel,
} from '@ionic/angular';
import { InmueblesRepository } from '../../core/data/inmuebles.repository';
import { RecordatoriosService } from '../../core/services/recordatorios.service';
import { Inmueble } from '../../core/models/inmueble.model';
import { Recordatorio, RecordatorioNuevo } from '../../core/models/recordatorio.model';
import { TIPOS_RECORDATORIO } from '../../shared/etiquetas';
import { proximaHora } from '../../shared/fechas';

@Component({
  selector: 'app-recordatorio-form',
  imports: [
    FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonContent,
    IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea, IonToggle, IonIcon, IonLabel,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/recordatorios" text="" /></ion-buttons>
        <ion-title>{{ id ? 'Editar recordatorio' : 'Nuevo recordatorio' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button [strong]="true" [disabled]="guardando()" (click)="guardar()">Guardar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item>
          <ion-input label="Título *" labelPlacement="stacked" placeholder="Llamar al cliente" [(ngModel)]="datos.titulo" />
        </ion-item>
        <ion-item>
          <ion-select label="Tipo" labelPlacement="stacked" interface="popover" [(ngModel)]="datos.tipo">
            @for (t of tipos; track t.valor) {
              <ion-select-option [value]="t.valor">{{ t.texto }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input label="Fecha y hora *" labelPlacement="stacked" type="datetime-local" [(ngModel)]="datos.fechaHora" />
        </ion-item>
        <ion-item>
          <ion-select label="Inmueble relacionado" labelPlacement="stacked" interface="action-sheet" [(ngModel)]="datos.inmuebleId">
            <ion-select-option [value]="null">Ninguno</ion-select-option>
            @for (i of inmuebles(); track i.id) {
              <ion-select-option [value]="i.id">{{ i.codigo }} · {{ i.titulo }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input label="Cliente" labelPlacement="stacked" [(ngModel)]="datos.cliente" />
        </ion-item>
        <ion-item>
          <ion-input label="Teléfono del cliente" labelPlacement="stacked" type="tel" [(ngModel)]="datos.telefonoCliente" />
          @if (datos.telefonoCliente) {
            <ion-button slot="end" fill="clear" [href]="'tel:' + datos.telefonoCliente" aria-label="Llamar">
              <ion-icon slot="icon-only" name="call-outline" />
            </ion-button>
          }
        </ion-item>
        <ion-item>
          <ion-textarea label="Descripción" labelPlacement="stacked" [autoGrow]="true" [(ngModel)]="datos.descripcion" />
        </ion-item>
        <ion-item>
          <ion-icon slot="start" name="notifications-outline" color="primary" />
          <ion-toggle [(ngModel)]="datos.notificar">Avisarme en el celular</ion-toggle>
        </ion-item>
        @if (id) {
          <ion-item>
            <ion-icon slot="start" name="checkmark-circle-outline" color="success" />
            <ion-toggle [(ngModel)]="datos.completado">Completado</ion-toggle>
          </ion-item>
        }
      </ion-list>

      @if (id) {
        <div class="ion-padding">
          <ion-button expand="block" fill="outline" color="danger" (click)="confirmarEliminar()">
            <ion-icon slot="start" name="trash-outline" />
            <ion-label>Eliminar recordatorio</ion-label>
          </ion-button>
        </div>
      }
    </ion-content>
  `,
})
export class RecordatorioFormPage {
  private route = inject(ActivatedRoute);
  private nav = inject(NavController);
  private toasts = inject(ToastController);
  private alertas = inject(AlertController);
  private inmueblesRepo = inject(InmueblesRepository);
  private recService = inject(RecordatoriosService);

  readonly tipos = TIPOS_RECORDATORIO;

  id = this.route.snapshot.paramMap.get('id');
  inmuebles = signal<Inmueble[]>([]);
  guardando = signal(false);
  private original?: Recordatorio;

  datos: RecordatorioNuevo = {
    titulo: '',
    descripcion: '',
    tipo: 'seguimiento',
    fechaHora: proximaHora(),
    inmuebleId: this.route.snapshot.queryParamMap.get('inmuebleId'),
    cliente: '',
    telefonoCliente: '',
    notificar: true,
    completado: false,
  };

  async ionViewWillEnter() {
    this.inmuebles.set(await this.inmueblesRepo.listar());
    if (!this.id) return;
    const rec = await this.recService.obtener(this.id);
    if (rec) {
      this.original = rec;
      const { id, creadoEn, notificacionId, ...resto } = rec;
      this.datos = { ...this.datos, ...resto, inmuebleId: resto.inmuebleId ?? null };
    }
  }

  async guardar() {
    if (!this.datos.titulo.trim() || !this.datos.fechaHora) {
      await this.avisar('El título y la fecha son obligatorios.');
      return;
    }
    this.guardando.set(true);
    try {
      await this.recService.guardar({ ...this.datos, titulo: this.datos.titulo.trim() }, this.id ?? undefined);
      await this.avisar(this.datos.notificar && !this.datos.completado ? 'Recordatorio guardado. Te avisaremos.' : 'Recordatorio guardado.');
      this.nav.back();
    } finally {
      this.guardando.set(false);
    }
  }

  async confirmarEliminar() {
    if (!this.original) return;
    const rec = this.original;
    const alerta = await this.alertas.create({
      header: 'Eliminar recordatorio',
      message: `¿Seguro que quieres eliminar "${rec.titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.recService.eliminar(rec);
            this.nav.back();
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
