import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  NavController, ToastController, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton,
  IonContent, IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea,
} from '@ionic/angular';
import { InmueblesRepository } from '../../core/data/inmuebles.repository';
import { InmuebleNuevo } from '../../core/models/inmueble.model';
import { ESTADOS_INMUEBLE, OPERACIONES, TIPOS_INMUEBLE } from '../../shared/etiquetas';

const VACIO: InmuebleNuevo = {
  codigo: '', titulo: '', tipo: 'departamento', operacion: 'venta', estado: 'disponible',
  precio: 0, ciudad: '', direccion: '', area: 0, habitaciones: null, banos: null,
  propietario: '', telefonoPropietario: '', fechaDisponible: null, notas: '',
};

@Component({
  selector: 'app-inmueble-form',
  imports: [
    FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonContent,
    IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/inmuebles" text="" /></ion-buttons>
        <ion-title>{{ id ? 'Editar inmueble' : 'Nuevo inmueble' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button [strong]="true" [disabled]="guardando()" (click)="guardar()">Guardar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item>
          <ion-input label="Código *" labelPlacement="stacked" placeholder="DEP-104" [(ngModel)]="datos.codigo" />
        </ion-item>
        <ion-item>
          <ion-input label="Título *" labelPlacement="stacked" placeholder="Apartamento Torre Sur 801" [(ngModel)]="datos.titulo" />
        </ion-item>
        <ion-item>
          <ion-select label="Tipo" labelPlacement="stacked" interface="popover" [(ngModel)]="datos.tipo">
            @for (t of tipos; track t.valor) {
              <ion-select-option [value]="t.valor">{{ t.texto }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select label="Operación" labelPlacement="stacked" interface="popover" [(ngModel)]="datos.operacion">
            @for (o of operaciones; track o.valor) {
              <ion-select-option [value]="o.valor">{{ o.texto }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select label="Estado" labelPlacement="stacked" interface="popover" [(ngModel)]="datos.estado">
            @for (e of estados; track e.valor) {
              <ion-select-option [value]="e.valor">{{ e.texto }}</ion-select-option>
            }
          </ion-select>
        </ion-item>
        @if (datos.estado !== 'disponible') {
          <ion-item>
            <ion-input label="Queda disponible el" labelPlacement="stacked" type="date" [(ngModel)]="datos.fechaDisponible" />
          </ion-item>
        }
        <ion-item>
          <ion-input
            [label]="datos.operacion === 'arriendo' ? 'Canon mensual (COP)' : 'Precio (COP)'"
            labelPlacement="stacked" type="number" inputmode="numeric" [(ngModel)]="datos.precio"
          />
        </ion-item>
        <ion-item>
          <ion-input label="Ciudad" labelPlacement="stacked" [(ngModel)]="datos.ciudad" />
        </ion-item>
        <ion-item>
          <ion-input label="Dirección" labelPlacement="stacked" [(ngModel)]="datos.direccion" />
        </ion-item>
        <ion-item>
          <ion-input label="Área (m²)" labelPlacement="stacked" type="number" inputmode="decimal" [(ngModel)]="datos.area" />
        </ion-item>
        <ion-item>
          <ion-input label="Habitaciones" labelPlacement="stacked" type="number" inputmode="numeric" [(ngModel)]="datos.habitaciones" />
        </ion-item>
        <ion-item>
          <ion-input label="Baños" labelPlacement="stacked" type="number" inputmode="numeric" [(ngModel)]="datos.banos" />
        </ion-item>
        <ion-item>
          <ion-input label="Propietario" labelPlacement="stacked" [(ngModel)]="datos.propietario" />
        </ion-item>
        <ion-item>
          <ion-input label="Teléfono del propietario" labelPlacement="stacked" type="tel" [(ngModel)]="datos.telefonoPropietario" />
        </ion-item>
        <ion-item>
          <ion-textarea label="Notas" labelPlacement="stacked" [autoGrow]="true" [(ngModel)]="datos.notas" />
        </ion-item>
      </ion-list>
    </ion-content>
  `,
})
export class InmuebleFormPage {
  private route = inject(ActivatedRoute);
  private nav = inject(NavController);
  private toasts = inject(ToastController);
  private repo = inject(InmueblesRepository);

  readonly tipos = TIPOS_INMUEBLE;
  readonly operaciones = OPERACIONES;
  readonly estados = ESTADOS_INMUEBLE;

  id = this.route.snapshot.paramMap.get('id');
  datos: InmuebleNuevo = { ...VACIO };
  guardando = signal(false);

  async ionViewWillEnter() {
    if (!this.id) return;
    const inm = await this.repo.obtener(this.id);
    if (inm) {
      const { id, actualizadoEn, ...resto } = inm;
      this.datos = { ...VACIO, ...resto };
    }
  }

  async guardar() {
    if (!this.datos.codigo.trim() || !this.datos.titulo.trim()) {
      await this.avisar('El código y el título son obligatorios.');
      return;
    }
    const numeroONulo = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v));
    const datos: InmuebleNuevo = {
      ...this.datos,
      codigo: this.datos.codigo.trim().toUpperCase(),
      titulo: this.datos.titulo.trim(),
      precio: Number(this.datos.precio) || 0,
      area: Number(this.datos.area) || 0,
      habitaciones: numeroONulo(this.datos.habitaciones),
      banos: numeroONulo(this.datos.banos),
      fechaDisponible: this.datos.estado === 'disponible' ? null : this.datos.fechaDisponible || null,
    };

    this.guardando.set(true);
    try {
      const inm = this.id ? await this.repo.actualizar(this.id, datos) : await this.repo.crear(datos);
      await this.avisar('Inmueble guardado.');
      this.nav.navigateBack(this.id ? `/inmueble/${inm.id}` : '/tabs/inmuebles');
    } finally {
      this.guardando.set(false);
    }
  }

  private async avisar(message: string) {
    const toast = await this.toasts.create({ message, duration: 1800, position: 'bottom' });
    await toast.present();
  }
}
