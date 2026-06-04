import { Component, inject } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { VehicleCardComponent } from './components/vehicle-card/vehicle-card.component';
import { FuelCardComponent } from './components/fuel-card/fuel-card.component';
import { ObligationsCardComponent } from './components/obligations-card/obligations-card.component';
import { MaintenanceCardComponent } from './components/maintenance-card/maintenance-card.component';
import { ResultPanelComponent } from './components/result-panel/result-panel.component';
import { ProformaCompareComponent } from './components/proforma-compare/proforma-compare.component';
import { LocalePillComponent } from './components/shared/locale-pill.component';
import { AccordionGroupComponent } from './components/shared/accordion-group.component';
import { AccordionItemComponent } from './components/shared/accordion-item.component';
import { FooterComponent } from './components/footer/footer.component';
import { CalculatorStateService } from './services/calculator-state.service';

@Component({
  selector: 'app-root',
  imports: [
    HeroComponent,
    VehicleCardComponent,
    FuelCardComponent,
    ObligationsCardComponent,
    MaintenanceCardComponent,
    ResultPanelComponent,
    ProformaCompareComponent,
    LocalePillComponent,
    AccordionGroupComponent,
    AccordionItemComponent,
    FooterComponent,
  ],
  template: `
    <div class="min-h-screen bg-[var(--bg)] overflow-x-hidden font-sans flex flex-col">
      <app-hero />
      <div class="grid grid-cols-1 min-[901px]:grid-cols-[1fr_550px] gap-6 items-start py-6 px-4 min-[901px]:py-8 min-[901px]:px-8">
        <div>
          <app-accordion-group>
            <app-accordion-item [index]="0" title="Datos del vehículo" icon="pi-car">
              <app-vehicle-card />
            </app-accordion-item>
            <app-accordion-item [index]="1" [title]="state.fuelSectionTitle()" [icon]="state.isElectric() ? 'pi-bolt' : 'pi-bolt'">
              <app-fuel-card />
            </app-accordion-item>
            <app-accordion-item [index]="2" title="Obligaciones anuales" icon="pi-shield">
              <app-obligations-card />
            </app-accordion-item>
            <app-accordion-item [index]="3" title="Mantenimiento y piezas" icon="pi-wrench"
              tip="Valores de referencia del mercado ecuatoriano 2026. Ajusta segun tu mecanico. Desactiva los items que no apliquen (ej: embrague en automatico).">
              <app-maintenance-card />
            </app-accordion-item>
          </app-accordion-group>
        </div>
        <div class="min-[901px]:sticky min-[901px]:top-6">
          <app-result-panel />
        </div>
      </div>
      <div class="px-4 min-[901px]:px-8 pb-8">
        <app-proforma-compare />
      </div>
      <div class="flex-1"></div>
      <app-footer />
    </div>
    <app-locale-pill />
  `,
})
export class App {
  state = inject(CalculatorStateService);
}
