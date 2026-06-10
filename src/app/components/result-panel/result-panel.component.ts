import { Component, inject, computed, signal, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { AppStore } from '../../store/app.store';
import { ProformaStorageService } from '../../services/proforma-storage.service';
import { BreakdownChartComponent } from './breakdown-chart/breakdown-chart.component';
import { DepreciationChartComponent } from './depreciation-chart/depreciation-chart.component';
import { LITERS_PER_GALLON } from '../../services/cost-calculation.service';
import { toPng } from 'html-to-image';
import { SupabaseService } from '../../services/supabase.service';

interface BreakdownRow { label: string; icon: string; perKm: number; color: string; }

export type DisplayUnit = 'km' | 'liter' | 'gallon' | 'kwh';

@Component({
  selector: 'app-result-panel',
  imports: [
    CommonModule,
    FormsModule,
    BreakdownChartComponent, DepreciationChartComponent,
  ],
  templateUrl: './result-panel.component.html',
})
export class ResultPanelComponent {
  state = inject(CalculatorStateService);
  appStore = inject(AppStore);
  proformaStorage = inject(ProformaStorageService);
  private supabase = inject(SupabaseService);

  panelRef = viewChild<ElementRef>('resultPanel');

  screenshotLoading = signal(false);

  modalOpen = signal(false);
  saveName = signal('');
  shareToggle = signal(false);
  saveResult = signal<'success' | 'full' | 'error' | null>(null);
  isSaving = signal(false);

  hasMakeModel = computed(() => {
    const v = this.state.vehicle();
    return !!(v.make && v.model);
  });

  canShare = this.hasMakeModel;

  toggleShare() {
    if (this.canShare()) this.shareToggle.update(v => !v);
  }

  openModal(): void {
    const v = this.state.vehicle();
    const name = v.make && v.model ? `${v.make} ${v.model}` : 'Mi vehículo';
    this.saveName.set(name);
    this.shareToggle.set(false);
    this.saveResult.set(null);
    this.isSaving.set(false);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.saveResult.set(null);
  }

  async confirmSave(): Promise<void> {
    if (this.isSaving()) return;
    this.isSaving.set(true);
    this.saveResult.set(null);

    const country = this.appStore.selectedCountry();
    const name = this.saveName().trim() || 'Mi vehículo';

    const saved = this.proformaStorage.save({
      name,
      countryCode: country.code,
      currency: country.currency,
      currencySymbol: country.currencySymbol,
      vehicle: this.state.vehicle(),
      fuel: this.state.fuel(),
      idle: this.state.idle(),
      obligations: this.state.obligations(),
      maintenanceItems: this.state.maintenanceItems(),
      vehicleLookupQuery: '',
      result: this.state.result(),
    });

    if (!saved) { this.saveResult.set('full'); this.isSaving.set(false); return; }

    if (this.shareToggle() && this.canShare()) {
      const v = this.state.vehicle();
      try {
        await this.supabase.save({
          country_code: country.code,
          make: v.make,
          model: v.model,
          trim: v.trim,
          year: v.vehicleYear,
          vehicle: v,
          fuel: this.state.fuel(),
          idle: this.state.idle(),
          obligations: this.state.obligations(),
          maintenance_items: this.state.maintenanceItems(),
          result: this.state.result(),
        });
      } catch {
        // local save succeeded — community share failed silently, don't block
      }
    }

    this.saveResult.set('success');
    this.isSaving.set(false);
    setTimeout(() => this.closeModal(), 1500);
  }

  async takeScreenshot() {
    const el = this.panelRef()?.nativeElement;
    if (!el) return;
    this.screenshotLoading.set(true);
    try {
      const dataUrl = await toPng(el, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'costos-vehiculo.png';
      link.href = dataUrl;
      link.click();
    } finally {
      this.screenshotLoading.set(false);
    }
  }

  displayUnit = signal<DisplayUnit>('km');

  private kmPerLiter = computed(() => {
    const f = this.state.fuel();
    return f.unit === 'kmL' ? f.rendimiento : f.rendimiento / LITERS_PER_GALLON;
  });

  private kmPerKwh = computed(() => {
    const f = this.state.fuel();
    return (f.consumptionKwh || 20) > 0 ? 100 / (f.consumptionKwh || 20) : 5;
  });

  multiplier = computed(() => {
    const u = this.displayUnit();
    if (u === 'liter') return this.kmPerLiter();
    if (u === 'gallon') return this.kmPerLiter() * LITERS_PER_GALLON;
    if (u === 'kwh') return this.kmPerKwh();
    return 1;
  });

  unitLabel = computed(() => {
    const u = this.displayUnit();
    if (u === 'liter') return 'litro';
    if (u === 'gallon') return 'galón';
    if (u === 'kwh') return 'kWh';
    return 'km';
  });

  unitTitle = computed(() => {
    const u = this.displayUnit();
    if (u === 'liter') return 'por litro de combustible';
    if (u === 'gallon') return 'por galón de combustible';
    if (u === 'kwh') return 'por kWh consumido';
    return 'por kilómetro recorrido';
  });

  heroFormat = computed(() => this.displayUnit() === 'km' ? '1.3-3' : '1.2-2');
  rowFormat  = computed(() => this.displayUnit() === 'km' ? '1.4-4' : '1.3-3');

  unitOptions = computed(() => {
    const isElectric = this.state.vehicle().isElectric;
    const base = [{ id: 'km', label: '/ km' }];
    if (isElectric) return [...base, { id: 'kwh', label: '/ kWh' }];
    return [...base, { id: 'liter', label: '/ litro' }, { id: 'gallon', label: '/ galón' }];
  });

  vehicleSpecs = this.state.vehicleSpecsBadge;

  headerBg = computed(() => {
    const v = this.state.vehicle();
    if (v.isElectric) return '#0a5276';
    if (v.vehicleType === 'motorcycle') return '#7f1d1d';
    return '#0F0F0F';
  });

  convert(perKm: number): number {
    return perKm * this.multiplier();
  }

  breakdownRows = computed((): BreakdownRow[] => {
    const r = this.state.result();
    return [
      { label: 'Combustible', icon: 'pi-bolt', perKm: r.fuelPerKm + r.idlePerKm, color: '#443FE9' },
      { label: 'Mantenimiento', icon: 'pi-wrench', perKm: r.maintPerKm, color: '#6B67FF' },
      { label: 'Depreciación', icon: 'pi-chart-line', perKm: r.deprPerKm, color: '#3b82f6' },
      { label: 'Seguros', icon: 'pi-shield', perKm: r.insurePerKm, color: '#f59e0b' },
      { label: 'Parqueadero', icon: 'pi-map-marker', perKm: r.parkPerKm, color: '#9ca3af' },
    ];
  });

  iconBg: Record<string, string> = {
    'pi-bolt': 'rgba(68,63,233,0.1)',
    'pi-wrench': 'rgba(107,103,255,0.12)',
    'pi-chart-line': 'rgba(59,130,246,0.1)',
    'pi-shield': 'rgba(245,158,11,0.1)',
    'pi-map-marker': 'rgba(107,114,128,0.1)',
  };

  pct(val: number): number {
    const total = this.state.result().totalPerKm || 1;
    return Math.min((val / total) * 100, 100);
  }
}
