import { Injectable } from '@angular/core';
import {
  CostBreakdown,
  DeprMethod,
  DeprPoint,
  FuelData,
  IdleData,
  MaintenanceItem,
  ObligationsData,
  VehicleData,
} from '../models/calculator.model';

export const LITERS_PER_GALLON = 3.785411784;
export const CURRENT_YEAR = 2026;

export const FUEL_DATA = {
  extra: { pricePerGal: 3.164, kmPerLiter: 12, kmPerGalon: 45 },
  super: { pricePerGal: 4.81, kmPerLiter: 11, kmPerGalon: 42 },
  diesel: { pricePerGal: 3.103, kmPerLiter: 16, kmPerGalon: 61 },
};

const ACCEL_RATES = [
  0.2, 0.18, 0.15, 0.12, 0.1, 0.09, 0.08, 0.08, 0.07, 0.07, 0.06, 0.06,
  0.05, 0.05, 0.05, 0.04, 0.04, 0.04, 0.03, 0.03,
];

@Injectable({ providedIn: 'root' })
export class CostCalculationService {
  fuelCostPerKm(fuel: FuelData): number {
    const pricePerLiter = fuel.pricePerGal / LITERS_PER_GALLON;
    if (fuel.unit === 'kmL') {
      return pricePerLiter / (fuel.rendimiento || 1);
    }
    return fuel.pricePerGal / (fuel.rendimiento || 1);
  }

  idleCostPerKm(idle: IdleData, fuel: FuelData, annualKm: number): number {
    if (!idle.enabled || annualKm <= 0) return 0;
    const pricePerLiter = fuel.pricePerGal / LITERS_PER_GALLON;
    return (idle.lph * idle.hours * pricePerLiter) / annualKm;
  }

  maintCostPerKm(items: MaintenanceItem[]): number {
    return items
      .filter((i) => i.enabled && i.every > 0)
      .reduce((sum, i) => sum + i.cost / i.every, 0);
  }

  deprCostPerKm(v: VehicleData): number {
    if (v.annualKm <= 0 || v.usefulLife <= 0) return 0;
    const totalKm = v.annualKm * v.usefulLife;

    if (v.deprMethod === 'linear') {
      return (v.vehicleValue - v.residualValue) / totalKm;
    }

    // Accelerated: project vehicleValue forward using ACCEL_RATES
    let projected = v.vehicleValue;
    for (let i = 0; i < v.usefulLife; i++) {
      const rate = ACCEL_RATES[Math.min(i, ACCEL_RATES.length - 1)];
      projected = projected * (1 - rate);
    }
    const futureResidual = Math.max(projected, v.residualValue);
    return (v.vehicleValue - futureResidual) / totalKm;
  }

  insuranceCostPerKm(obl: ObligationsData, annualKm: number): number {
    if (annualKm <= 0) return 0;
    return (obl.matricula + obl.soat + obl.seguroPrivado + obl.revisionTecnica) / annualKm;
  }

  parkingCostPerKm(parking: number, annualKm: number): number {
    if (annualKm <= 0) return 0;
    return (parking * 12) / annualKm;
  }

  calculate(
    vehicle: VehicleData,
    fuel: FuelData,
    idle: IdleData,
    obligations: ObligationsData,
    items: MaintenanceItem[]
  ): CostBreakdown {
    const fuelPerKm = this.fuelCostPerKm(fuel);
    const idlePerKm = this.idleCostPerKm(idle, fuel, vehicle.annualKm);
    const maintPerKm = this.maintCostPerKm(items);
    const deprPerKm = this.deprCostPerKm(vehicle);
    const insurePerKm = this.insuranceCostPerKm(obligations, vehicle.annualKm);
    const parkPerKm = this.parkingCostPerKm(obligations.parking, vehicle.annualKm);
    const totalPerKm = fuelPerKm + idlePerKm + maintPerKm + deprPerKm + insurePerKm + parkPerKm;
    const annualTotal = totalPerKm * vehicle.annualKm;

    return {
      fuelPerKm,
      idlePerKm,
      maintPerKm,
      deprPerKm,
      insurePerKm,
      parkPerKm,
      totalPerKm,
      annualTotal,
      monthlyTotal: annualTotal / 12,
      dailyTotal: annualTotal / 365,
    };
  }

  buildDepreciationCurve(v: VehicleData): DeprPoint[] {
    const points: DeprPoint[] = [];
    const endYear = CURRENT_YEAR + v.usefulLife;
    const ageCurrent = CURRENT_YEAR - v.vehicleYear;

    for (let y = v.vehicleYear; y <= endYear; y++) {
      const age = y - v.vehicleYear;
      let val: number;

      if (y <= CURRENT_YEAR) {
        if (ageCurrent <= 0) {
          val = v.vehicleValue;
        } else if (v.deprMethod === 'linear') {
          const annualDrop = (v.purchasePrice - v.vehicleValue) / ageCurrent;
          val = v.purchasePrice - annualDrop * age;
        } else {
          let simVal = v.purchasePrice;
          for (let i = 0; i < age; i++) {
            simVal *= 1 - ACCEL_RATES[Math.min(i, ACCEL_RATES.length - 1)];
          }
          // Scale to match vehicleValue at CURRENT_YEAR
          let simAtCurrent = v.purchasePrice;
          for (let i = 0; i < ageCurrent; i++) {
            simAtCurrent *= 1 - ACCEL_RATES[Math.min(i, ACCEL_RATES.length - 1)];
          }
          const scale = simAtCurrent > 0 ? v.vehicleValue / simAtCurrent : 1;
          val = simVal * scale;
        }
      } else {
        const futureAge = y - CURRENT_YEAR;
        if (v.deprMethod === 'linear') {
          const annualDrop = (v.vehicleValue - v.residualValue) / v.usefulLife;
          val = v.vehicleValue - annualDrop * futureAge;
        } else {
          val = v.vehicleValue;
          for (let i = 0; i < futureAge; i++) {
            const rate = ACCEL_RATES[Math.min(ageCurrent + i, ACCEL_RATES.length - 1)];
            val *= 1 - rate;
          }
        }
        val = Math.max(val, v.residualValue);
      }

      points.push({ year: y, value: Math.round(val) });
    }

    return points;
  }

  fuelEquivalentLabel(fuel: FuelData): string {
    const pricePerLiter = fuel.pricePerGal / LITERS_PER_GALLON;
    if (fuel.unit === 'kmL') {
      return `${(fuel.rendimiento * LITERS_PER_GALLON).toFixed(1)} km/galón · $${pricePerLiter.toFixed(4)}/litro`;
    }
    return `${(fuel.rendimiento / LITERS_PER_GALLON).toFixed(2)} km/litro · $${pricePerLiter.toFixed(4)}/litro`;
  }
}
