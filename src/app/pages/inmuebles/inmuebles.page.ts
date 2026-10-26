import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonSegment, IonSegmentButton, IonLabel,
  IonChip, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge,
  IonFab, IonFabButton, IonRefresher, IonRefresherContent, RefresherCustomEvent,
} from '@ionic/angular';
import { InmueblesRepository } from '../../core/data/inmuebles.repository';
import { EstadoInmueble, Inmueble, TipoInmueble } from '../../core/models/inmueble.model';
import { ESTADOS_INMUEBLE, TIPOS_INMUEBLE, estadoInmueble, tipoInmueble } from '../../shared/etiquetas';

@Component({
  selector: 'app-inmuebles',
  imports: [
    CurrencyPipe, IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonSegment, IonSegmentButton,
    IonLabel, IonChip, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonBadge, IonFab, IonFabButton, IonRefresher, IonRefresherContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Inmuebles</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          placeholder="Buscar por código, título, dirección o propietario"
          [debounce]="250"
          (ionInput)="busqueda.set($event.detail.value ?? '')"
        />
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="estado()" [scrollable]="true" (ionChange)="estado.set($any($event.detail.value))">
          <ion-segment-button value="todos"><ion-label>Todos</ion-label></ion-segment-button>
          @for (e of estados; track e.valor) {
            <ion-segment-button [value]="e.valor"><ion-label>{{ e.texto }}</ion-label></ion-segment-button>
          }
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refrescar($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div class="chips-scroll">
        @for (t of tipos; track t.valor) {
          <ion-chip [outline]="tipo() !== t.valor" color="primary" (click)="alternarTipo(t.valor)">
            <ion-icon [name]="t.icono" />
            <ion-label>{{ t.texto }}</ion-label>
          </ion-chip>
        }
      </div>

      @for (i of filtrados(); track i.id) {
        <ion-card button (click)="abrir(i)">
          <ion-card-header>
            <ion-card-subtitle>
              <ion-icon [name]="tipoDe(i).icono" /> {{ i.codigo }} · {{ tipoDe(i).texto }} en {{ i.operacion }}
            </ion-card-subtitle>
            <ion-card-title>{{ i.titulo }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
              <span class="precio">
                {{ i.precio | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}{{ i.operacion === 'arriendo' ? ' / mes' : '' }}
              </span>
              <ion-badge [color]="estadoDe(i).color">{{ estadoDe(i).texto }}</ion-badge>
            </div>
            <div class="dato-fila">
              <span><ion-icon name="location-outline" />{{ i.ciudad }}</span>
              <span><ion-icon name="resize-outline" />{{ i.area }} m²</span>
              @if (i.habitaciones) { <span><ion-icon name="bed-outline" />{{ i.habitaciones }}</span> }
              @if (i.banos) { <span><ion-icon name="water-outline" />{{ i.banos }}</span> }
            </div>
          </ion-card-content>
        </ion-card>
      } @empty {
        <div class="vacio">
          <ion-icon name="business-outline" />
          <p>No hay inmuebles que coincidan con el filtro.</p>
        </div>
      }

      <div style="height: 80px"></div>

      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button (click)="router.navigateByUrl('/inmueble/nuevo')">
          <ion-icon name="add-outline" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
})
export class InmueblesPage {
  router = inject(Router);
  private repo = inject(InmueblesRepository);

  readonly estados = ESTADOS_INMUEBLE;
  readonly tipos = TIPOS_INMUEBLE;

  inmuebles = signal<Inmueble[]>([]);
  busqueda = signal('');
  estado = signal<EstadoInmueble | 'todos'>('todos');
  tipo = signal<TipoInmueble | null>(null);

  filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const estado = this.estado();
    const tipo = this.tipo();
    return this.inmuebles().filter((i) => {
      if (estado !== 'todos' && i.estado !== estado) return false;
      if (tipo && i.tipo !== tipo) return false;
      if (!q) return true;
      return [i.codigo, i.titulo, i.direccion, i.ciudad, i.propietario].some((c) => c.toLowerCase().includes(q));
    });
  });

  ionViewWillEnter() {
    this.cargar();
  }

  async cargar() {
    this.inmuebles.set(await this.repo.listar());
  }

  async refrescar(ev: RefresherCustomEvent) {
    await this.cargar();
    ev.target.complete();
  }

  alternarTipo(t: TipoInmueble) {
    this.tipo.set(this.tipo() === t ? null : t);
  }

  tipoDe = (i: Inmueble) => tipoInmueble(i.tipo);
  estadoDe = (i: Inmueble) => estadoInmueble(i.estado);

  abrir(i: Inmueble) {
    this.router.navigateByUrl('/inmueble/' + i.id);
  }
}
