import { computed, inject, Injectable, signal } from '@angular/core';
import {
  FuelData,
  FuelType,
  IdleData,
  MaintenanceItem,
  ObligationsData,
  VehicleData,
} from '../models/calculator.model';
import { CostCalculationService, FUEL_DATA } from './cost-calculation.service';

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

@Injectable({ providedIn: 'root' })
export class CalculatorStateService {
  private calc = inject(CostCalculationService);
  private nextId = 14;

  vehicle = signal<VehicleData>({
    purchasePrice: 22000,
    vehicleYear: 2022,
    vehicleValue: 18000,
    residualValue: 4000,
    annualKm: 20000,
    usefulLife: 8,
    deprMethod: 'accel',
  });

  fuel = signal<FuelData>({
    type: 'extra',
    unit: 'kmL',
    rendimiento: 12,
    pricePerGal: 3.164,
  });

  idle = signal<IdleData>({
    enabled: true,
    lph: 0.8,
    hours: 250,
  });

  obligations = signal<ObligationsData>({
    matricula: 120,
    soat: 80,
    seguroPrivado: 400,
    revisionTecnica: 35,
    parking: 60,
  });

  maintenanceItems = signal<MaintenanceItem[]>([...DEFAULT_MAINTENANCE]);

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

  patchVehicle(patch: Partial<VehicleData>) {
    this.vehicle.update((v) => ({ ...v, ...patch }));
  }

  patchFuel(patch: Partial<FuelData>) {
    this.fuel.update((f) => ({ ...f, ...patch }));
  }

  setFuelType(type: FuelType) {
    const d = FUEL_DATA[type];
    const unit = this.fuel().unit;
    this.fuel.update((f) => ({
      ...f,
      type,
      pricePerGal: d.pricePerGal,
      rendimiento: unit === 'kmL' ? d.kmPerLiter : d.kmPerGalon,
    }));
  }

  setFuelUnit(unit: 'kmL' | 'kmG') {
    const d = FUEL_DATA[this.fuel().type];
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
    const newItem: MaintenanceItem = {
      id: this.nextId++,
      name,
      cost,
      every,
      enabled: true,
    };
    this.maintenanceItems.update((items) => [...items, newItem]);
  }

  reset() {
    this.vehicle.set({
      purchasePrice: 22000,
      vehicleYear: 2022,
      vehicleValue: 18000,
      residualValue: 4000,
      annualKm: 20000,
      usefulLife: 8,
      deprMethod: 'accel',
    });
    this.fuel.set({ type: 'extra', unit: 'kmL', rendimiento: 12, pricePerGal: 3.164 });
    this.idle.set({ enabled: true, lph: 0.8, hours: 250 });
    this.obligations.set({
      matricula: 120,
      soat: 80,
      seguroPrivado: 400,
      revisionTecnica: 35,
      parking: 60,
    });
    this.maintenanceItems.set([...DEFAULT_MAINTENANCE]);
    this.nextId = 14;
  }
}
