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
    <div class="min-h-screen bg-[var(--bg)] overflow-x-hidden font-sans">
      <app-hero />
      <div class="grid grid-cols-1 min-[901px]:grid-cols-[1fr_550px] gap-6 items-start py-6 px-4 min-[901px]:py-8 min-[901px]:px-8">
        <div>
          <app-vehicle-card />
          <app-fuel-card />
          <app-obligations-card />
          <app-maintenance-card />
        </div>
        <div class="min-[901px]:sticky min-[901px]:top-6">
          <app-result-panel />
        </div>
      </div>
      <div id="print-report"></div>
    </div>
    <app-locale-pill />
  `,
})
export class App { }
