import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { FuelType } from '../models/calculator.model';
import { CountryCatalogService } from '../services/country-catalog.service';
import type { MonthlyFuelPriceSet } from '../services/monthly-fuel-price.service';

const COUNTRY_STORAGE_KEY = 'kilometro-claro-country';

export interface FuelPreset {
  type: FuelType;
  label: string;
  pricePerGal: number;
  kmPerLiter: number;
  kmPerGalon: number;
}

export interface CountryConfig {
  code: string;
  alpha3?: string;
  name: string;
  flag?: string;
  region?: string;
  subregion?: string;
  currency: string;
  currencyName?: string;
  currencySymbol: string;
  fuels: FuelPreset[];
  fuelPriceInfo?: MonthlyFuelPriceSet | null;
}

export const DEFAULT_COUNTRY_CONFIGS: CountryConfig[] = [
  {
    code: 'ec',
    alpha3: 'ECU',
    name: 'Ecuador',
    flag: '🇪🇨',
    region: 'Americas',
    subregion: 'South America',
    currency: 'USD',
    currencyName: 'United States dollar',
    currencySymbol: '$',
    fuels: [
      { type: 'extra',  label: 'Extra / Ecopais',  pricePerGal: 3.164, kmPerLiter: 12, kmPerGalon: 45 },
      { type: 'super',  label: 'Super 95',          pricePerGal: 4.81,  kmPerLiter: 11, kmPerGalon: 42 },
      { type: 'diesel', label: 'Diesel premium',    pricePerGal: 3.103, kmPerLiter: 16, kmPerGalon: 61 },
    ],
    fuelPriceInfo: {
      countryCode: 'ec',
      periodLabel: '12 mayo - 11 junio 2026',
      sourceName: 'ARC / ARCH Ecuador',
      sourceUrl:
        'https://www.metroecuador.com.ec/noticias/2026/05/12/estos-son-los-precios-oficiales-de-la-gasolina-en-ecuador-como-denunciar-sobreprecios/',
      fuels: [
        { type: 'extra', label: 'Extra / Ecopais', pricePerGal: 3.164, kmPerLiter: 12, kmPerGalon: 45 },
        { type: 'super', label: 'Super 95', pricePerGal: 4.81, kmPerLiter: 11, kmPerGalon: 42 },
        { type: 'diesel', label: 'Diesel premium', pricePerGal: 3.103, kmPerLiter: 16, kmPerGalon: 61 },
      ],
    },
  },
];

interface AppState {
  selectedCountryCode: string;
  countries: CountryConfig[];
  countriesLoading: boolean;
  countriesError: string;
}

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState<AppState>({
    selectedCountryCode: 'ec',
    countries: DEFAULT_COUNTRY_CONFIGS,
    countriesLoading: false,
    countriesError: '',
  }),
  withComputed(({ selectedCountryCode, countries }) => ({
    selectedCountry: computed(
      () => countries().find((c) => c.code === selectedCountryCode()) ?? DEFAULT_COUNTRY_CONFIGS[0]
    ),
    allCountries: computed(() => countries()),
  })),
  withMethods((store, countryCatalog = inject(CountryCatalogService)) => ({
    async loadCountries(): Promise<void> {
      if (store.countriesLoading()) return;
      patchState(store, { countriesLoading: true, countriesError: '' });

      try {
        const countries = await countryCatalog.loadCountries();
        const savedCode =
          typeof localStorage === 'undefined' ? '' : localStorage.getItem(COUNTRY_STORAGE_KEY);
        const selectedCountryCode = countries.some((country) => country.code === savedCode)
          ? savedCode || store.selectedCountryCode()
          : store.selectedCountryCode();

        patchState(store, { countries, selectedCountryCode, countriesLoading: false });
      } catch {
        patchState(store, {
          countries: DEFAULT_COUNTRY_CONFIGS,
          countriesLoading: false,
          countriesError: 'No pude cargar la lista de paises. Uso Ecuador por defecto.',
        });
      }
    },
    selectCountry(code: string): void {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(COUNTRY_STORAGE_KEY, code);
      }
      patchState(store, { selectedCountryCode: code });
    },
  }))
);
