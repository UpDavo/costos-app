export type FuelType = 'extra' | 'super' | 'diesel' | 'electric';
export type FuelUnit = 'kmL' | 'kmG';
export type DeprMethod = 'accel' | 'linear';
export type Transmission = 'manual' | 'automatic';
export type VehicleType = 'car' | 'motorcycle';

export interface VehicleData {
  vehicleType: VehicleType;
  purchasePrice: number;
  vehicleYear: number;
  engineDisplacement: string;
  turbo: boolean;
  isElectric: boolean;
  isNew: boolean;
  transmission: Transmission;
  vehicleValue: number;
  residualValue: number;
  purchaseKm: number;
  currentKm: number;
  annualKm: number;
  usefulLife: number;
  deprMethod: DeprMethod;
  electricMaintCost: number;
  electricMaintEvery: number;
  includeDepr: boolean;
}

export interface FuelData {
  type: FuelType;
  unit: FuelUnit;
  rendimiento: number;
  pricePerGal: number;
  consumptionKwh: number;
  pricePerKwh: number;
}

export interface IdleData {
  enabled: boolean;
  lph: number;
  hours: number;
}

export interface ObligationsData {
  matricula: number;
  soat: number;
  seguroPrivado: number;
  revisionTecnica: number;
  parking: number;
}

export interface MaintenanceItem {
  id: number;
  name: string;
  cost: number;
  every: number;
  enabled: boolean;
}

export interface CostBreakdown {
  fuelPerKm: number;
  idlePerKm: number;
  maintPerKm: number;
  deprPerKm: number;
  insurePerKm: number;
  parkPerKm: number;
  totalPerKm: number;
  annualTotal: number;
  monthlyTotal: number;
  dailyTotal: number;
}

export interface DeprPoint {
  year: number;
  value: number;
}

export interface SavedProforma {
  id: string;
  name: string;
  savedAt: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  vehicle: VehicleData;
  fuel: FuelData;
  idle: IdleData;
  obligations: ObligationsData;
  maintenanceItems: MaintenanceItem[];
  vehicleLookupQuery: string;
  result: CostBreakdown;
}
