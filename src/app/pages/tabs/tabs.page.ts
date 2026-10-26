import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="inicio">
          <ion-icon name="grid-outline" />
          <ion-label>Inicio</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="inmuebles">
          <ion-icon name="business-outline" />
          <ion-label>Inmuebles</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="recordatorios">
          <ion-icon name="alarm-outline" />
          <ion-label>Recordatorios</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="ajustes">
          <ion-icon name="settings-outline" />
          <ion-label>Ajustes</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {}
