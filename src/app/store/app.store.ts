import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { FuelType } from '../models/calculator.model';

export interface FuelPreset {
  type: FuelType;
  label: string;
  pricePerGal: number;
  kmPerLiter: number;
  kmPerGalon: number;
}

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  fuels: FuelPreset[];
}

export const COUNTRY_CONFIGS: CountryConfig[] = [
  {
    code: 'ec',
    name: 'Ecuador',
    currency: 'USD',
    currencySymbol: '$',
    fuels: [
      { type: 'extra',  label: 'Extra / Ecopaís', pricePerGal: 3.164, kmPerLiter: 12, kmPerGalon: 45 },
      { type: 'super',  label: 'Súper 95',         pricePerGal: 4.81,  kmPerLiter: 11, kmPerGalon: 42 },
      { type: 'diesel', label: 'Diésel',            pricePerGal: 3.103, kmPerLiter: 16, kmPerGalon: 61 },
    ],
  },
];

interface AppState {
  selectedCountryCode: string;
}

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState<AppState>({ selectedCountryCode: 'ec' }),
  withComputed(({ selectedCountryCode }) => ({
    selectedCountry: computed(
      () => COUNTRY_CONFIGS.find((c) => c.code === selectedCountryCode()) ?? COUNTRY_CONFIGS[0]
    ),
    allCountries: computed(() => COUNTRY_CONFIGS),
  })),
  withMethods((store) => ({
    selectCountry(code: string): void {
      patchState(store, { selectedCountryCode: code });
    },
  }))
);
