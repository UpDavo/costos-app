import { Injectable } from '@angular/core';
import { FuelType } from '../models/calculator.model';
import type { FuelPreset } from '../store/app.store';

export interface MonthlyFuelPriceSet {
  countryCode: string;
  periodLabel: string;
  sourceName: string;
  sourceUrl: string;
  fuels: FuelPreset[];
}

const GENERIC_FUELS: FuelPreset[] = [
  { type: 'extra', label: 'Regular', pricePerGal: 0, kmPerLiter: 12, kmPerGalon: 45 },
  { type: 'super', label: 'Premium', pricePerGal: 0, kmPerLiter: 11, kmPerGalon: 42 },
  { type: 'diesel', label: 'Diesel', pricePerGal: 0, kmPerLiter: 16, kmPerGalon: 61 },
];

const MONTHLY_PRICES: Record<string, MonthlyFuelPriceSet> = {
  ec: {
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
};

@Injectable({ providedIn: 'root' })
export class MonthlyFuelPriceService {
  pricesForCountry(countryCode: string): MonthlyFuelPriceSet | null {
    return MONTHLY_PRICES[countryCode.toLowerCase()] ?? null;
  }

  fuelsForCountry(countryCode: string): FuelPreset[] {
    return this.pricesForCountry(countryCode)?.fuels ?? GENERIC_FUELS;
  }

  presetForType(countryCode: string, type: FuelType): FuelPreset | undefined {
    return this.fuelsForCountry(countryCode).find((fuel) => fuel.type === type);
  }
}
