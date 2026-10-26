import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonLabel, IonNote, IonCheckbox,
} from '@ionic/angular';
import { Recordatorio } from '../../core/models/recordatorio.model';
import { tipoRecordatorio } from '../etiquetas';
import { estaVencido } from '../fechas';

/** Fila de recordatorio reutilizable (Inicio, Recordatorios y Detalle de inmueble). */
@Component({
  selector: 'app-recordatorio-item',
  imports: [DatePipe, IonItem, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonLabel, IonNote, IonCheckbox],
  template: `
    <ion-item-sliding>
      <ion-item [button]="true" [detail]="false" (click)="abrir.emit(rec())">
        <ion-checkbox
          slot="start"
          [checked]="rec().completado"
          (click)="$event.stopPropagation()"
          (ionChange)="completar.emit({ rec: rec(), valor: $event.detail.checked })"
          aria-label="Completado"
        />
        <ion-label [class.tachado]="rec().completado">
          <h2>{{ rec().titulo }}</h2>
          <p>
            <ion-icon [name]="tipo().icono" [color]="tipo().color" />
            {{ tipo().texto }}
            @if (rec().cliente) { · {{ rec().cliente }} }
          </p>
          <p [class.vencido]="vencido()">
            <ion-icon name="time-outline" />
            {{ rec().fechaHora | date: "EEE d MMM, h:mm a" }}
            @if (vencido()) { · Vencido }
          </p>
        </ion-label>
        @if (rec().notificar && !rec().completado) {
          <ion-note slot="end"><ion-icon name="notifications-outline" /></ion-note>
        }
      </ion-item>
      <ion-item-options side="end">
        <ion-item-option color="danger" (click)="eliminar.emit(rec())">
          <ion-icon slot="icon-only" name="trash-outline" />
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  `,
})
export class RecordatorioItemComponent {
  rec = input.required<Recordatorio>();
  abrir = output<Recordatorio>();
  completar = output<{ rec: Recordatorio; valor: boolean }>();
  eliminar = output<Recordatorio>();

  tipo = () => tipoRecordatorio(this.rec().tipo);
  vencido = () => !this.rec().completado && estaVencido(this.rec().fechaHora);
}
