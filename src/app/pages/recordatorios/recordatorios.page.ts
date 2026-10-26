import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonLabel, IonChip, IonIcon,
  IonList, IonFab, IonFabButton, IonRefresher, IonRefresherContent, RefresherCustomEvent,
} from '@ionic/angular';
import { RecordatoriosService } from '../../core/services/recordatorios.service';
import { Recordatorio, TipoRecordatorio } from '../../core/models/recordatorio.model';
import { RecordatorioItemComponent } from '../../shared/componentes/recordatorio-item.component';
import { TIPOS_RECORDATORIO } from '../../shared/etiquetas';
import { esHoy, estaVencido } from '../../shared/fechas';

type Vista = 'pendientes' | 'completados' | 'todos';

@Component({
  selector: 'app-recordatorios',
  imports: [
    RecordatorioItemComponent, IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton,
    IonLabel, IonChip, IonIcon, IonList, IonFab, IonFabButton, IonRefresher, IonRefresherContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Recordatorios</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="vista()" (ionChange)="vista.set($any($event.detail.value))">
          <ion-segment-button value="pendientes"><ion-label>Pendientes</ion-label></ion-segment-button>
          <ion-segment-button value="completados"><ion-label>Completados</ion-label></ion-segment-button>
          <ion-segment-button value="todos"><ion-label>Todos</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refrescar($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div class="chips-scroll">
        @for (t of tipos; track t.valor) {
          <ion-chip [outline]="tipo() !== t.valor" [color]="t.color" (click)="alternarTipo(t.valor)">
            <ion-icon [name]="t.icono" />
            <ion-label>{{ t.texto }}</ion-label>
          </ion-chip>
        }
      </div>

      @for (grupo of grupos(); track grupo.titulo) {
        <div class="titulo-seccion">{{ grupo.titulo }}</div>
        <ion-list>
          @for (r of grupo.items; track r.id) {
            <app-recordatorio-item [rec]="r" (abrir)="abrir($event)" (completar)="completar($event)" (eliminar)="eliminar($event)" />
          }
        </ion-list>
      } @empty {
        <div class="vacio">
          <ion-icon name="alarm-outline" />
          <p>No hay recordatorios en esta vista.</p>
        </div>
      }

      <div style="height: 80px"></div>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button (click)="router.navigateByUrl('/recordatorio/nuevo')">
          <ion-icon name="add-outline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
})
export class RecordatoriosPage {
  router = inject(Router);
  private recService = inject(RecordatoriosService);

  readonly tipos = TIPOS_RECORDATORIO;

  recordatorios = signal<Recordatorio[]>([]);
  vista = signal<Vista>('pendientes');
  tipo = signal<TipoRecordatorio | null>(null);

  filtrados = computed(() => {
    const vista = this.vista();
    const tipo = this.tipo();
    return this.recordatorios().filter((r) => {
      if (vista === 'pendientes' && r.completado) return false;
      if (vista === 'completados' && !r.completado) return false;
      return !tipo || r.tipo === tipo;
    });
  });

  /** Agrupa en Vencidos / Hoy / Próximos (los completados van aparte). */
  grupos = computed(() => {
    const lista = this.filtrados();
    const pendientes = lista.filter((r) => !r.completado);
    const grupos = [
      { titulo: 'Vencidos', items: pendientes.filter((r) => estaVencido(r.fechaHora) && !esHoy(r.fechaHora)) },
      { titulo: 'Hoy', items: pendientes.filter((r) => esHoy(r.fechaHora)) },
      { titulo: 'Próximos', items: pendientes.filter((r) => !estaVencido(r.fechaHora) && !esHoy(r.fechaHora)) },
      { titulo: 'Completados', items: lista.filter((r) => r.completado).reverse() },
    ];
    return grupos.filter((g) => g.items.length);
  });

  ionViewWillEnter() {
    this.cargar();
  }

  async cargar() {
    this.recordatorios.set(await this.recService.listar());
  }

  async refrescar(ev: RefresherCustomEvent) {
    await this.cargar();
    ev.target.complete();
  }

  alternarTipo(t: TipoRecordatorio) {
    this.tipo.set(this.tipo() === t ? null : t);
  }

  abrir(r: Recordatorio) {
    this.router.navigateByUrl('/recordatorio/' + r.id);
  }

  async completar(e: { rec: Recordatorio; valor: boolean }) {
    await this.recService.marcarCompletado(e.rec, e.valor);
    await this.cargar();
  }

  async eliminar(r: Recordatorio) {
    await this.recService.eliminar(r);
    await this.cargar();
  }
}
