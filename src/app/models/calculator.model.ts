export type FuelType = 'extra' | 'super' | 'diesel';
export type FuelUnit = 'kmL' | 'kmG';
export type DeprMethod = 'accel' | 'linear';

export interface VehicleData {
  purchasePrice: number;
  vehicleYear: number;
  vehicleValue: number;
  residualValue: number;
  purchaseKm: number;
  annualKm: number;
  usefulLife: number;
  deprMethod: DeprMethod;
}

export interface FuelData {
  type: FuelType;
  unit: FuelUnit;
  rendimiento: number;
  pricePerGal: number;
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
