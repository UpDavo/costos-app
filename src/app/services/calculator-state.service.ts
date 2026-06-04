import { computed, effect, inject, Injectable, PLATFORM_ID, signal, untracked } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  FuelData,
  FuelType,
  IdleData,
  MaintenanceItem,
  ObligationsData,
  Transmission,
  VehicleData,
} from '../models/calculator.model';
import { CostCalculationService, FUEL_DATA } from './cost-calculation.service';
import type { VehicleLookupResult } from './vehicle-lookup.service';
import type { FuelPreset } from '../store/app.store';

const STORAGE_KEY = 'costos-app-state';

const DEFAULT_MAINTENANCE: MaintenanceItem[] = [
  { id: 0, name: 'Cambio de aceite y filtro', cost: 35, every: 5000, enabled: true },
  { id: 1, name: 'Cambio de filtro de aire', cost: 18, every: 20000, enabled: true },
  { id: 2, name: 'Cambio de filtro de combustible', cost: 20, every: 40000, enabled: true },
  { id: 3, name: 'Pastillas de freno (eje delantero)', cost: 70, every: 25000, enabled: true },
  { id: 4, name: 'Pastillas de freno (eje trasero)', cost: 60, every: 40000, enabled: true },
  { id: 5, name: 'Discos de freno (delanteros)', cost: 160, every: 80000, enabled: true },
  { id: 6, name: 'Kit de embrague completo', cost: 350, every: 100000, enabled: true },
  { id: 7, name: 'Bujías (juego de 4)', cost: 60, every: 30000, enabled: true },
  { id: 8, name: 'Correa de distribución + kit', cost: 200, every: 60000, enabled: true },
  { id: 9, name: 'Amortiguadores (juego)', cost: 320, every: 80000, enabled: true },
  { id: 10, name: 'Neumáticos (juego de 4)', cost: 480, every: 50000, enabled: true },
  { id: 11, name: 'Batería', cost: 110, every: 40000, enabled: true },
  { id: 12, name: 'Alineación y balanceo', cost: 18, every: 10000, enabled: true },
  { id: 13, name: 'Líquido de frenos', cost: 15, every: 30000, enabled: true },
];

const DEFAULT_VEHICLE: VehicleData = {
  purchasePrice: 22000,
  vehicleYear: 2022,
  engineDisplacement: '',
  turbo: false,
  isElectric: false,
  transmission: 'manual',
  vehicleValue: 18000,
  residualValue: 4000,
  purchaseKm: 0,
  currentKm: 0,
  annualKm: 20000,
  usefulLife: 8,
  deprMethod: 'accel',
};

const DEFAULT_FUEL: FuelData = {
  type: 'extra', unit: 'kmL', rendimiento: 12, pricePerGal: 3.164,
  consumptionKwh: 18, pricePerKwh: 0.10,
};

const ELECTRIC_DISABLED_IDS = new Set([0, 1, 2, 6, 7, 8]);
const DEFAULT_IDLE: IdleData = { enabled: true, lph: 0.8, hours: 250 };
const DEFAULT_OBLIGATIONS: ObligationsData = {
  matricula: 120, soat: 80, seguroPrivado: 400, revisionTecnica: 35, parking: 60,
};

@Injectable({ providedIn: 'root' })
export class CalculatorStateService {
  private calc = inject(CostCalculationService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private nextId = 14;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  saveStatus = signal<'saved' | 'saving'>('saved');

  vehicle = signal<VehicleData>({ ...DEFAULT_VEHICLE });
  fuel = signal<FuelData>({ ...DEFAULT_FUEL });
  idle = signal<IdleData>({ ...DEFAULT_IDLE });
  obligations = signal<ObligationsData>({ ...DEFAULT_OBLIGATIONS });
  maintenanceItems = signal<MaintenanceItem[]>([...DEFAULT_MAINTENANCE]);
  vehicleLookupQuery = signal('Ford Ranger 2.5 nafta 2023');
  vehicleLookupResult = signal<VehicleLookupResult | null>(null);

  constructor() {
    this.loadFromStorage();

    effect(() => {
      const snapshot = {
        vehicle: this.vehicle(),
        fuel: this.fuel(),
        idle: this.idle(),
        obligations: this.obligations(),
        maintenanceItems: this.maintenanceItems(),
        vehicleLookupQuery: this.vehicleLookupQuery(),
        vehicleLookupResult: this.vehicleLookupResult(),
      };

      untracked(() => {
        this.saveStatus.set('saving');
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => {
          if (this.isBrowser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
          }
          this.saveStatus.set('saved');
        }, 800);
      });
    });
  }

  private loadFromStorage(): void {
    if (!this.isBrowser) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.vehicle) this.vehicle.set({ ...DEFAULT_VEHICLE, ...saved.vehicle });
      if (saved.fuel) this.fuel.set({ ...DEFAULT_FUEL, ...saved.fuel });
      if (saved.idle) this.idle.set(saved.idle);
      if (saved.obligations) this.obligations.set(saved.obligations);
      if (saved.vehicleLookupQuery) this.vehicleLookupQuery.set(saved.vehicleLookupQuery);
      if (saved.vehicleLookupResult) this.vehicleLookupResult.set(saved.vehicleLookupResult);
      if (saved.maintenanceItems) {
        this.maintenanceItems.set(saved.maintenanceItems);
        const maxId = (saved.maintenanceItems as MaintenanceItem[]).reduce(
          (m: number, i: MaintenanceItem) => Math.max(m, i.id), 13
        );
        this.nextId = maxId + 1;
      }
    } catch {
      // corrupted storage — ignore, use defaults
    }
  }

  result = computed(() =>
    this.calc.calculate(
      this.vehicle(),
      this.fuel(),
      this.idle(),
      this.obligations(),
      this.maintenanceItems()
    )
  );

  depreciationCurve = computed(() => this.calc.buildDepreciationCurve(this.vehicle()));
  fuelLabel = computed(() => this.calc.fuelEquivalentLabel(this.fuel()));

  // Global display computed — inject anywhere, no need to dig into vehicle()
  isElectric      = computed(() => this.vehicle().isElectric);
  transmission    = computed(() => this.vehicle().transmission);
  energyUnitLabel = computed(() => this.vehicle().isElectric ? 'kWh' : 'litro');
  energyUnitGalon = computed(() => this.vehicle().isElectric ? 'kWh' : 'galón');
  consumptionUnit = computed(() => this.vehicle().isElectric ? 'kWh/100km' : 'km/L');
  fuelSectionTitle = computed(() => this.vehicle().isElectric ? 'Energía' : 'Combustible');

  vehicleTypeLabel = computed(() => {
    const v = this.vehicle();
    if (v.isElectric) return 'Eléctrico';
    const parts: string[] = [];
    if (v.engineDisplacement) parts.push(`${v.engineDisplacement}L`);
    if (v.turbo) parts.push('Turbo');
    return parts.length ? parts.join(' ') : 'Combustión';
  });

  vehicleSpecsBadge = computed(() => {
    const v = this.vehicle();
    const parts: string[] = [];
    if (v.isElectric) { parts.push('⚡ Eléctrico'); }
    else {
      if (v.engineDisplacement) parts.push(`${v.engineDisplacement}L`);
      if (v.turbo) parts.push('Turbo');
    }
    parts.push(v.transmission === 'manual' ? 'Manual' : 'Automático');
    if (v.purchaseKm > 0) parts.push(`${v.purchaseKm.toLocaleString()} km (usado)`);
    return parts.join(' · ');
  });

  patchVehicle(patch: Partial<VehicleData>) {
    this.vehicle.update((v) => ({ ...v, ...patch }));
  }

  setVehicleLookupQuery(query: string) {
    this.vehicleLookupQuery.set(query);
  }

  setVehicleLookupResult(result: VehicleLookupResult | null) {
    this.vehicleLookupResult.set(result);
  }

  patchFuel(patch: Partial<FuelData>) {
    this.fuel.update((f) => ({ ...f, ...patch }));
  }

  setFuelType(type: FuelType, preset?: FuelPreset) {
    if (type === 'electric') { this.fuel.update((f) => ({ ...f, type })); return; }
    const d = preset ?? FUEL_DATA[type as keyof typeof FUEL_DATA];
    const unit = this.fuel().unit;
    this.fuel.update((f) => ({
      ...f,
      type,
      pricePerGal: d.pricePerGal > 0 ? d.pricePerGal : f.pricePerGal,
      rendimiento: unit === 'kmL' ? d.kmPerLiter : d.kmPerGalon,
    }));
  }

  setFuelUnit(unit: 'kmL' | 'kmG') {
    const currentType = this.fuel().type;
    if (currentType === 'electric') { this.fuel.update((f) => ({ ...f, unit })); return; }
    const d = FUEL_DATA[currentType as keyof typeof FUEL_DATA];
    this.fuel.update((f) => ({
      ...f,
      unit,
      rendimiento: unit === 'kmL' ? d.kmPerLiter : d.kmPerGalon,
    }));
  }

  patchIdle(patch: Partial<IdleData>) {
    this.idle.update((i) => ({ ...i, ...patch }));
  }

  patchObligations(patch: Partial<ObligationsData>) {
    this.obligations.update((o) => ({ ...o, ...patch }));
  }

  updateMaintenanceItem(id: number, patch: Partial<MaintenanceItem>) {
    this.maintenanceItems.update((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  removeMaintenanceItem(id: number) {
    this.maintenanceItems.update((items) => items.filter((i) => i.id !== id));
  }

  addMaintenanceItem(name: string, cost: number, every: number) {
    const newItem: MaintenanceItem = { id: this.nextId++, name, cost, every, enabled: true };
    this.maintenanceItems.update((items) => [...items, newItem]);
  }

  setElectric(isElectric: boolean): void {
    this.vehicle.update((v) => ({ ...v, isElectric, ...(isElectric ? { transmission: 'automatic' as const, engineDisplacement: '', turbo: false } : {}) }));
    if (isElectric) {
      this.fuel.update((f) => ({ ...f, type: 'electric' as FuelType }));
      this.maintenanceItems.update((items) =>
        items.map((i) => ELECTRIC_DISABLED_IDS.has(i.id) ? { ...i, enabled: false } : i)
      );
    } else {
      this.fuel.update((f) => ({ ...f, type: 'extra' as FuelType }));
      this.maintenanceItems.update((items) =>
        items.map((i) =>
          ELECTRIC_DISABLED_IDS.has(i.id)
            ? { ...i, enabled: this.vehicle().transmission === 'manual' || i.id !== 6 }
            : i
        )
      );
    }
  }

  setTransmission(transmission: Transmission): void {
    this.vehicle.update((v) => ({ ...v, transmission }));
    if (!this.vehicle().isElectric) {
      this.maintenanceItems.update((items) =>
        items.map((i) => i.id === 6 ? { ...i, enabled: transmission === 'manual' } : i)
      );
    }
  }

  reset() {
    this.vehicle.set({ ...DEFAULT_VEHICLE });
    this.fuel.set({ ...DEFAULT_FUEL });
    this.idle.set({ ...DEFAULT_IDLE });
    this.obligations.set({ ...DEFAULT_OBLIGATIONS });
    this.maintenanceItems.set([...DEFAULT_MAINTENANCE]);
    this.vehicleLookupQuery.set('Ford Ranger 2.5 nafta 2023');
    this.vehicleLookupResult.set(null);
    this.nextId = 14;
    if (this.isBrowser) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.saveStatus.set('saved');
  }
}
