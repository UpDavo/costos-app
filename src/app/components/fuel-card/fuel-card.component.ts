import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { LITERS_PER_GALLON } from '../../services/cost-calculation.service';
import { AppStore, FuelPreset } from '../../store/app.store';
import { InfoTooltipComponent } from '../shared/info-tooltip.component';
import { ToggleComponent } from '../shared/toggle.component';

@Component({
  selector: 'app-fuel-card',
  imports: [CommonModule, FormsModule, InputNumberModule, InfoTooltipComponent, ToggleComponent],
  templateUrl: './fuel-card.component.html',
})
export class FuelCardComponent implements OnInit {
  state = inject(CalculatorStateService);
  appStore = inject(AppStore);
  countryFilter = signal('');
  showCountryOptions = signal(false);

  ngOnInit(): void {
    void this.appStore.loadCountries();
  }

  selectedCountryLabel = computed(() => {
    const country = this.appStore.selectedCountry();
    return `${country.flag ? `${country.flag} ` : ''}${country.name} (${country.currency})`;
  });

  filteredCountries = computed(() => {
    const filter = this.normalize(this.countryFilter());
    const countries = this.appStore.allCountries();
    if (!filter) return countries.slice(0, 30);

    return countries
      .filter((country) => {
        const haystack = this.normalize(
          `${country.name} ${country.currency} ${country.currencyName ?? ''} ${country.region ?? ''}`
        );
        return haystack.includes(filter);
      })
      .slice(0, 40);
  });

  rendLabel = computed(() =>
    this.state.fuel().unit === 'kmL' ? 'Rendimiento (km / litro)' : 'Rendimiento (km / galón)'
  );

  fuelEquivalentLabel = computed(() => {
    const fuel = this.state.fuel();
    const sym = this.appStore.selectedCountry().currencySymbol;
    const pricePerLiter = fuel.pricePerGal / LITERS_PER_GALLON;

    if (fuel.unit === 'kmL') {
      return `${(fuel.rendimiento * LITERS_PER_GALLON).toFixed(1)} km/galon · ${sym}${pricePerLiter.toFixed(4)}/litro`;
    }

    return `${(fuel.rendimiento / LITERS_PER_GALLON).toFixed(2)} km/litro · ${sym}${pricePerLiter.toFixed(4)}/litro`;
  });

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

  selectCountry(code: string) {
    this.appStore.selectCountry(code);
    this.countryFilter.set('');
    this.showCountryOptions.set(false);

    const country = this.appStore.allCountries().find((item) => item.code === code);
    const preset = country?.fuels[0];
    if (preset) {
      this.state.setFuelType(preset.type, preset);
    }
  }

  selectFuel(opt: FuelPreset) {
    this.state.setFuelType(opt.type, opt);
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
