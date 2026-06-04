import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { VehicleCardComponent } from './components/vehicle-card/vehicle-card.component';
import { FuelCardComponent } from './components/fuel-card/fuel-card.component';
import { ObligationsCardComponent } from './components/obligations-card/obligations-card.component';
import { MaintenanceCardComponent } from './components/maintenance-card/maintenance-card.component';
import { ResultPanelComponent } from './components/result-panel/result-panel.component';
import { LocalePillComponent } from './components/shared/locale-pill.component';

@Component({
  selector: 'app-root',
  imports: [
    HeroComponent,
    VehicleCardComponent,
    FuelCardComponent,
    ObligationsCardComponent,
    MaintenanceCardComponent,
    ResultPanelComponent,
    LocalePillComponent,
  ],
  template: `
    <div class="app-shell">
      <app-hero />
      <div class="main-layout">
        <div class="left-panel">
          <app-vehicle-card />
          <app-fuel-card />
          <app-obligations-card />
          <app-maintenance-card />
        </div>
        <div class="right-panel">
          <app-result-panel />
        </div>
      </div>
      <div id="print-report"></div>
    </div>
    <app-locale-pill />
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      background: var(--bg, #f2f4f3);
      font-family: 'Roboto', sans-serif;
      overflow-x: hidden;
    }
    .main-layout {
      padding: 1.5rem 1rem;
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 1.5rem;
      align-items: start;
    }
    .right-panel {
      position: sticky;
      top: 1.5rem;
    }
    @media (min-width: 901px) {
      .main-layout { padding: 2rem 2rem; }
    }
    @media (max-width: 900px) {
      .main-layout { grid-template-columns: 1fr; }
      .right-panel { position: static; }
    }
  `],
})
export class App { }
