import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { LITERS_PER_GALLON } from '../../services/cost-calculation.service';
import { AppStore } from '../../store/app.store';
import { InfoTooltipComponent } from '../shared/info-tooltip.component';

@Component({
  selector: 'app-fuel-card',
  imports: [CommonModule, FormsModule, InputNumberModule, ToggleSwitchModule, InfoTooltipComponent],
  templateUrl: './fuel-card.component.html',
})
export class FuelCardComponent {
  state = inject(CalculatorStateService);
  appStore = inject(AppStore);

  rendLabel = computed(() =>
    this.state.fuel().unit === 'kmL' ? 'Rendimiento (km / litro)' : 'Rendimiento (km / galón)'
  );

  idleExplain = computed(() => {
    const idle = this.state.idle();
    const fuel = this.state.fuel();
    const vehicle = this.state.vehicle();
    const sym = this.appStore.selectedCountry().currencySymbol;
    const pricePerLiter = fuel.pricePerGal / LITERS_PER_GALLON;
    const annualCost = idle.lph * idle.hours * pricePerLiter;
    const perKm = vehicle.annualKm > 0 ? annualCost / vehicle.annualKm : 0;
    return `<b style="color:var(--text)">Ecuación:</b> ${idle.lph} L/h × ${idle.hours} h/año × ${sym}${pricePerLiter.toFixed(4)}/L = <b style="color:var(--primary)">${sym}${annualCost.toFixed(2)}/año</b> &nbsp;→&nbsp; ÷ ${vehicle.annualKm.toLocaleString('es-EC')} km = <b style="color:var(--primary)">${sym}${perKm.toFixed(4)}/km</b>`;
  });
}
