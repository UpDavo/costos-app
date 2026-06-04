import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { CURRENT_YEAR } from '../../services/cost-calculation.service';
import { AppStore } from '../../store/app.store';
import { InfoTooltipComponent } from '../shared/info-tooltip.component';
@Component({
  selector: 'app-vehicle-card',
  imports: [CommonModule, FormsModule, InputNumberModule, InfoTooltipComponent],
  templateUrl: './vehicle-card.component.html',
})
export class VehicleCardComponent {
  state = inject(CalculatorStateService);
  appStore = inject(AppStore);

  ageLabel = computed(() => {
    const age = CURRENT_YEAR - this.state.vehicle().vehicleYear;
    if (age <= 0) return 'este año';
    return `${age} ${age === 1 ? 'año' : 'años'}`;
  });

  lossPct = computed(() => {
    const v = this.state.vehicle();
    if (v.purchasePrice <= 0) return '0.0';
    return (((v.purchasePrice - v.vehicleValue) / v.purchasePrice) * 100).toFixed(1);
  });
}
