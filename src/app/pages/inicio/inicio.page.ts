import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonIcon, IonList, IonItem, IonLabel,
  IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonNote, RefresherCustomEvent,
} from '@ionic/angular';
import { InmueblesRepository } from '../../core/data/inmuebles.repository';
import { RecordatoriosService } from '../../core/services/recordatorios.service';
import { Inmueble } from '../../core/models/inmueble.model';
import { Recordatorio } from '../../core/models/recordatorio.model';
import { RecordatorioItemComponent } from '../../shared/componentes/recordatorio-item.component';
import { diasHasta, esHoy, estaVencido } from '../../shared/fechas';
import { tipoInmueble } from '../../shared/etiquetas';

@Component({
  selector: 'app-inicio',
  imports: [
    DatePipe, RecordatorioItemComponent, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonIcon,
    IonList, IonItem, IonLabel, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Inicio</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refrescar($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div class="resumen-grid">
        <ion-card class="resumen-card" button (click)="ir('/tabs/inmuebles')">
          <ion-icon name="key-outline" color="success" />
          <div class="numero">{{ disponibles() }}</div>
          <div class="etiqueta">Disponibles</div>
        </ion-card>
        <ion-card class="resumen-card" button (click)="ir('/tabs/inmuebles')">
          <ion-icon name="time-outline" color="warning" />
          <div class="numero">{{ reservados() }}</div>
          <div class="etiqueta">Reservados</div>
        </ion-card>
        <ion-card class="resumen-card" button (click)="ir('/tabs/recordatorios')">
          <ion-icon name="calendar-outline" color="primary" />
          <div class="numero">{{ deHoy().length }}</div>
          <div class="etiqueta">Para hoy</div>
        </ion-card>
        <ion-card class="resumen-card" button (click)="ir('/tabs/recordatorios')">
          <ion-icon name="alert-circle-outline" color="danger" />
          <div class="numero">{{ vencidos().length }}</div>
          <div class="etiqueta">Vencidos</div>
        </ion-card>
      </div>

      @if (vencidos().length) {
        <div class="titulo-seccion">Vencidos</div>
        <ion-list>
          @for (r of vencidos(); track r.id) {
            <app-recordatorio-item [rec]="r" (abrir)="abrir($event)" (completar)="completar($event)" (eliminar)="eliminar($event)" />
          }
        </ion-list>
      }

      <div class="titulo-seccion">Hoy</div>
      @if (deHoy().length) {
        <ion-list>
          @for (r of deHoy(); track r.id) {
            <app-recordatorio-item [rec]="r" (abrir)="abrir($event)" (completar)="completar($event)" (eliminar)="eliminar($event)" />
          }
        </ion-list>
      } @else {
        <ion-item lines="none"><ion-label color="medium">No tienes recordatorios para hoy.</ion-label></ion-item>
      }

      <div class="titulo-seccion">Próximos a quedar disponibles</div>
      @if (proximosDisponibles().length) {
        <ion-list>
          @for (i of proximosDisponibles(); track i.id) {
            <ion-item [button]="true" (click)="ir('/inmueble/' + i.id)">
              <ion-icon slot="start" [name]="icono(i)" color="primary" />
              <ion-label>
                <h2>{{ i.codigo }} · {{ i.titulo }}</h2>
                <p>Libre el {{ i.fechaDisponible | date: "d 'de' MMMM" }}</p>
              </ion-label>
              <ion-note slot="end">{{ faltan(i) }}</ion-note>
            </ion-item>
          }
        </ion-list>
      } @else {
        <ion-item lines="none"><ion-label color="medium">Ningún inmueble tiene fecha de liberación.</ion-label></ion-item>
      }

      <div style="height: 80px"></div>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button (click)="ir('/recordatorio/nuevo')">
          <ion-icon name="add-outline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
})
export class InicioPage {
  private router = inject(Router);
  private inmueblesRepo = inject(InmueblesRepository);
  private recService = inject(RecordatoriosService);

  inmuebles = signal<Inmueble[]>([]);
  recordatorios = signal<Recordatorio[]>([]);

  disponibles = computed(() => this.inmuebles().filter((i) => i.estado === 'disponible').length);
  reservados = computed(() => this.inmuebles().filter((i) => i.estado === 'reservado').length);
  pendientes = computed(() => this.recordatorios().filter((r) => !r.completado));
  deHoy = computed(() => this.pendientes().filter((r) => esHoy(r.fechaHora)));
  vencidos = computed(() => this.pendientes().filter((r) => estaVencido(r.fechaHora) && !esHoy(r.fechaHora)));
  proximosDisponibles = computed(() =>
    this.inmuebles()
      .filter((i) => i.estado !== 'disponible' && i.fechaDisponible && diasHasta(i.fechaDisponible) >= 0)
      .sort((a, b) => a.fechaDisponible!.localeCompare(b.fechaDisponible!)),
  );

  /** Ionic llama esto cada vez que la pantalla se muestra. */
  ionViewWillEnter() {
    this.cargar();
  }

  async cargar() {
    const [inms, recs] = await Promise.all([this.inmueblesRepo.listar(), this.recService.listar()]);
    this.inmuebles.set(inms);
    this.recordatorios.set(recs);
  }

  async refrescar(ev: RefresherCustomEvent) {
    await this.cargar();
    ev.target.complete();
  }

  icono = (i: Inmueble) => tipoInmueble(i.tipo).icono;

  faltan(i: Inmueble) {
    const d = diasHasta(i.fechaDisponible!);
    return d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : `En ${d} días`;
  }

  ir(url: string) {
    this.router.navigateByUrl(url);
  }

  abrir(r: Recordatorio) {
    this.ir('/recordatorio/' + r.id);
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
