import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { CURRENT_YEAR } from '../../services/cost-calculation.service';
import { AppStore } from '../../store/app.store';
import { VehicleLookupService } from '../../services/vehicle-lookup.service';
import { InfoTooltipComponent } from '../shared/info-tooltip.component';
@Component({
  selector: 'app-vehicle-card',
  imports: [CommonModule, FormsModule, InputNumberModule, InfoTooltipComponent],
  templateUrl: './vehicle-card.component.html',
})
export class VehicleCardComponent {
  state = inject(CalculatorStateService);
  appStore = inject(AppStore);
  private vehicleLookup = inject(VehicleLookupService);

  lookupError = signal('');
  isLookingUp = signal(false);

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

  suggestedAnnualKm = computed((): number | null => {
    const v = this.state.vehicle();
    if (v.currentKm <= v.purchaseKm) return null;
    const elapsed = Math.max(CURRENT_YEAR - v.vehicleYear, 0.5);
    return Math.round((v.currentKm - v.purchaseKm) / elapsed);
  });

  async searchVehicle() {
    const query = this.state.vehicleLookupQuery().trim();
    if (!query || this.isLookingUp()) return;

    this.lookupError.set('');
    this.isLookingUp.set(true);
    try {
      const result = await this.vehicleLookup.search(query);
      this.state.setVehicleLookupResult(result);
      if (result.year) {
        this.state.patchVehicle({ vehicleYear: result.year });
      }
    } catch (error) {
      this.state.setVehicleLookupResult(null);
      this.lookupError.set(error instanceof Error ? error.message : 'No pude consultar el vehículo.');
    } finally {
      this.isLookingUp.set(false);
    }
  }
}
