import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface NhtsaModel {
  Make_ID?: number;
  Make_Name?: string;
  Model_ID?: number;
  Model_Name?: string;
  VehicleTypeName?: string;
}

interface NhtsaResponse<T> {
  Count: number;
  Message: string;
  Results: T[];
}

export interface VehicleLookupResult {
  query: string;
  make: string;
  model: string;
  year?: number;
  vehicleType?: string;
  sourceName: string;
  sourceUrl: string;
  note: string;
}

interface ParsedVehicleQuery {
  make: string;
  model: string;
  year?: number;
}

const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const FUEL_WORDS = new Set([
  'diesel',
  'diésel',
  'nafta',
  'gasolina',
  'gas',
  'extra',
  'super',
  'súper',
  'hibrido',
  'híbrido',
  'electrico',
  'eléctrico',
]);

@Injectable({ providedIn: 'root' })
export class VehicleLookupService {
  private http = inject(HttpClient);

  async search(query: string): Promise<VehicleLookupResult> {
    const parsed = this.parseQuery(query);
    const encodedMake = encodeURIComponent(parsed.make);
    const url = parsed.year
      ? `${NHTSA_BASE_URL}/GetModelsForMakeYear/make/${encodedMake}/modelyear/${parsed.year}?format=json`
      : `${NHTSA_BASE_URL}/GetModelsForMake/${encodedMake}?format=json`;

    const response = await firstValueFrom(this.http.get<NhtsaResponse<NhtsaModel>>(url));
    const match = this.pickBestMatch(response.Results ?? [], parsed.model);

    if (!match) {
      throw new Error('No encontré ese vehículo en la base pública.');
    }

    return {
      query: query.trim(),
      make: match.Make_Name || parsed.make,
      model: match.Model_Name || parsed.model,
      year: parsed.year,
      vehicleType: match.VehicleTypeName,
      sourceName: 'NHTSA vPIC',
      sourceUrl: 'https://vpic.nhtsa.dot.gov/api/',
      note: 'Datos oficiales de marca/modelo. La cilindrada, versión y consumo pueden variar por mercado.',
    };
  }

  private parseQuery(query: string): ParsedVehicleQuery {
    const cleaned = query.trim().replace(/\s+/g, ' ');
    if (!cleaned) throw new Error('Escribe marca, modelo y año.');

    const yearMatch = cleaned.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? Number(yearMatch[0]) : undefined;
    const withoutYear = cleaned.replace(/\b(19|20)\d{2}\b/g, '').trim();
    const parts = withoutYear.split(' ').filter(Boolean);

    if (parts.length < 2) {
      throw new Error('Escribe al menos marca y modelo. Ej: Ford Ranger 2023.');
    }

    const [make, ...modelParts] = parts;
    const model = modelParts
      .filter((part) => !FUEL_WORDS.has(part.toLowerCase()) && !/^\d+(\.\d+)?$/.test(part))
      .join(' ');

    return {
      make,
      model: model || modelParts.join(' '),
      year,
    };
  }

  private pickBestMatch(models: NhtsaModel[], targetModel: string): NhtsaModel | undefined {
    const normalizedTarget = this.normalize(targetModel);
    if (!normalizedTarget) return models[0];

    return (
      models.find((model) => this.normalize(model.Model_Name ?? '') === normalizedTarget) ??
      models.find((model) => this.normalize(model.Model_Name ?? '').includes(normalizedTarget)) ??
      models.find((model) => normalizedTarget.includes(this.normalize(model.Model_Name ?? ''))) ??
      models[0]
    );
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }
}
