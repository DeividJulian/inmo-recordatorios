import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  AlertController, NavController, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton,
  IonContent, IonIcon, IonList, IonItem, IonLabel, IonBadge, IonNote,
} from '@ionic/angular';
import { InmueblesRepository } from '../../core/data/inmuebles.repository';
import { RecordatoriosService } from '../../core/services/recordatorios.service';
import { Inmueble } from '../../core/models/inmueble.model';
import { Recordatorio } from '../../core/models/recordatorio.model';
import { RecordatorioItemComponent } from '../../shared/componentes/recordatorio-item.component';
import { estadoInmueble, tipoInmueble } from '../../shared/etiquetas';

@Component({
  selector: 'app-inmueble-detalle',
  imports: [
    CurrencyPipe, DatePipe, RecordatorioItemComponent, IonHeader, IonToolbar, IonTitle, IonButtons,
    IonBackButton, IonButton, IonContent, IonIcon, IonList, IonItem, IonLabel, IonBadge, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/inmuebles" text="" /></ion-buttons>
        <ion-title>{{ inmueble()?.codigo ?? 'Inmueble' }}</ion-title>
        @if (inmueble(); as i) {
          <ion-buttons slot="end">
            <ion-button (click)="router.navigateByUrl('/inmueble/' + i.id + '/editar')" aria-label="Editar">
              <ion-icon slot="icon-only" name="create-outline" />
            </ion-button>
            <ion-button (click)="confirmarEliminar(i)" aria-label="Eliminar">
              <ion-icon slot="icon-only" name="trash-outline" />
            </ion-button>
          </ion-buttons>
        }
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (inmueble(); as i) {
        <div class="ion-padding">
          <h2 style="margin: 0 0 6px">{{ i.titulo }}</h2>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <span class="precio" style="font-size: 20px">
              {{ i.precio | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}{{ i.operacion === 'arriendo' ? ' / mes' : '' }}
            </span>
            <ion-badge [color]="estadoDe(i).color">{{ estadoDe(i).texto }}</ion-badge>
          </div>
        </div>

        <ion-list>
          <ion-item>
            <ion-icon slot="start" [name]="tipoDe(i).icono" color="primary" />
            <ion-label>{{ tipoDe(i).texto }} en {{ i.operacion }}</ion-label>
          </ion-item>
          <ion-item>
            <ion-icon slot="start" name="location-outline" color="primary" />
            <ion-label class="ion-text-wrap">
              <h3>{{ i.direccion }}</h3>
              <p>{{ i.ciudad }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-icon slot="start" name="resize-outline" color="primary" />
            <ion-label>
              {{ i.area }} m²
              @if (i.habitaciones) { · {{ i.habitaciones }} hab. }
              @if (i.banos) { · {{ i.banos }} baños }
            </ion-label>
          </ion-item>
          @if (i.fechaDisponible && i.estado !== 'disponible') {
            <ion-item>
              <ion-icon slot="start" name="key-outline" color="success" />
              <ion-label>Libre el {{ i.fechaDisponible | date: "d 'de' MMMM 'de' y" }}</ion-label>
            </ion-item>
          }
          <ion-item [href]="'tel:' + i.telefonoPropietario" [detail]="false">
            <ion-icon slot="start" name="person-outline" color="primary" />
            <ion-label>
              <h3>{{ i.propietario }}</h3>
              <p>Propietario · {{ i.telefonoPropietario }}</p>
            </ion-label>
            <ion-icon slot="end" name="call-outline" color="success" />
          </ion-item>
          @if (i.notas) {
            <ion-item>
              <ion-icon slot="start" name="document-text-outline" color="primary" />
              <ion-label class="ion-text-wrap">{{ i.notas }}</ion-label>
            </ion-item>
          }
        </ion-list>

        <div class="titulo-seccion" style="display: flex; justify-content: space-between; align-items: center">
          <span>Recordatorios</span>
          <ion-button fill="clear" size="small" (click)="nuevoRecordatorio(i)">
            <ion-icon slot="start" name="add-outline" /> Nuevo
          </ion-button>
        </div>
        @if (recordatorios().length) {
          <ion-list>
            @for (r of recordatorios(); track r.id) {
              <app-recordatorio-item [rec]="r" (abrir)="abrir($event)" (completar)="completar($event)" (eliminar)="eliminar($event)" />
            }
          </ion-list>
        } @else {
          <ion-item lines="none"><ion-label color="medium">Este inmueble no tiene recordatorios.</ion-label></ion-item>
        }

        <ion-note class="ion-padding" style="display: block">
          Actualizado el {{ i.actualizadoEn | date: "d MMM y, h:mm a" }}
        </ion-note>
      } @else if (cargado()) {
        <div class="vacio">
          <ion-icon name="alert-circle-outline" />
          <p>No se encontró el inmueble.</p>
        </div>
      }
    </ion-content>
  `,
})
export class InmuebleDetallePage {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private nav = inject(NavController);
  private alertas = inject(AlertController);
  private repo = inject(InmueblesRepository);
  private recService = inject(RecordatoriosService);

  inmueble = signal<Inmueble | undefined>(undefined);
  recordatorios = signal<Recordatorio[]>([]);
  cargado = signal(false);

  ionViewWillEnter() {
    this.cargar();
  }

  async cargar() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const [inm, recs] = await Promise.all([this.repo.obtener(id), this.recService.listarPorInmueble(id)]);
    this.inmueble.set(inm);
    this.recordatorios.set(recs);
    this.cargado.set(true);
  }

  tipoDe = (i: Inmueble) => tipoInmueble(i.tipo);
  estadoDe = (i: Inmueble) => estadoInmueble(i.estado);

  nuevoRecordatorio(i: Inmueble) {
    this.router.navigate(['/recordatorio/nuevo'], { queryParams: { inmuebleId: i.id } });
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

  async confirmarEliminar(i: Inmueble) {
    const alerta = await this.alertas.create({
      header: 'Eliminar inmueble',
      message: `¿Seguro que quieres eliminar ${i.codigo}? Sus recordatorios también se eliminarán.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            for (const r of this.recordatorios()) {
              await this.recService.eliminar(r);
            }
            await this.repo.eliminar(i.id);
            this.nav.navigateBack('/tabs/inmuebles');
          },
        },
      ],
    });
    await alerta.present();
  }
}
