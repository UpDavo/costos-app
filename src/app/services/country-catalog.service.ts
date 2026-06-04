import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { CountryConfig } from '../store/app.store';
import { MonthlyFuelPriceService } from './monthly-fuel-price.service';

interface RestCountryCurrency {
  name?: string;
  symbol?: string;
}

interface RestCountry {
  name?: {
    common?: string;
    official?: string;
    nativeName?: Record<string, { common?: string; official?: string }>;
  };
  cca2?: string;
  cca3?: string;
  flag?: string;
  region?: string;
  subregion?: string;
  currencies?: Record<string, RestCountryCurrency>;
}

const REST_COUNTRIES_URL =
  'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,currencies,flag,region,subregion';

@Injectable({ providedIn: 'root' })
export class CountryCatalogService {
  private http = inject(HttpClient);
  private monthlyFuelPrices = inject(MonthlyFuelPriceService);

  async loadCountries(): Promise<CountryConfig[]> {
    const countries = await firstValueFrom(this.http.get<RestCountry[]>(REST_COUNTRIES_URL));
    return countries
      .map((country) => this.toCountryConfig(country))
      .filter((country): country is CountryConfig => Boolean(country))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private toCountryConfig(country: RestCountry): CountryConfig | null {
    const code = country.cca2?.toLowerCase();
    const name = country.name?.common;
    const currencies = country.currencies ?? {};
    const [currencyCode, currency] = Object.entries(currencies)[0] ?? [];

    if (!code || !name || !currencyCode) return null;

    return {
      code,
      alpha3: country.cca3,
      name,
      flag: country.flag,
      region: country.region,
      subregion: country.subregion,
      currency: currencyCode,
      currencyName: currency?.name,
      currencySymbol: currency?.symbol ?? currencyCode,
      fuels: this.monthlyFuelPrices.fuelsForCountry(code),
      fuelPriceInfo: this.monthlyFuelPrices.pricesForCountry(code),
    };
  }
}
