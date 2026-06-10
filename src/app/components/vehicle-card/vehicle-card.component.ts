import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { CURRENT_YEAR } from '../../services/cost-calculation.service';
import { AppStore } from '../../store/app.store';
import { MAKE_NAMES, getModelsForMake } from '../../data/vehicle-catalog';
import { InfoTooltipComponent } from '../shared/info-tooltip.component';
import { SearchableSelectComponent } from '../shared/searchable-select.component';

@Component({
  selector: 'app-vehicle-card',
  imports: [CommonModule, FormsModule, InputNumberModule, InfoTooltipComponent, SearchableSelectComponent],
  templateUrl: './vehicle-card.component.html',
})
export class VehicleCardComponent {
  state = inject(CalculatorStateService);
  appStore = inject(AppStore);

  readonly makes = MAKE_NAMES;
  models = computed(() => getModelsForMake(this.state.vehicle().make));

  readonly yearOptions: number[] = Array.from(
    { length: CURRENT_YEAR + 1 - 1990 + 1 },
    (_, i) => CURRENT_YEAR + 1 - i
  );

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

  newLossPct = computed(() => {
    const v = this.state.vehicle();
    if (v.purchasePrice <= 0) return '0.0';
    return (((v.purchasePrice - v.residualValue) / v.purchasePrice) * 100).toFixed(1);
  });

  suggestedAnnualKm = computed((): number | null => {
    const v = this.state.vehicle();
    if (v.currentKm <= v.purchaseKm) return null;
    const elapsed = Math.max(CURRENT_YEAR - v.vehicleYear, 0.5);
    return Math.round((v.currentKm - v.purchaseKm) / elapsed);
  });

  onMakeChange(make: string) {
    this.state.patchVehicle({ make, model: '' });
  }

  onModelChange(model: string) {
    this.state.patchVehicle({ model });
  }
}
