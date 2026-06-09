import { Component, inject, computed, signal, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ProformaStorageService } from '../../services/proforma-storage.service';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { CostCalculationService, CURRENT_YEAR } from '../../services/cost-calculation.service';
import { AppStore } from '../../store/app.store';
import { SavedProforma, CostBreakdown } from '../../models/calculator.model';
import { toPng } from 'html-to-image';

interface BreakdownRow { label: string; icon: string; perKm: number; color: string; }

const CATEGORIES = [
  { label: 'Combustible', color: '#443FE9' },
  { label: 'Mantenimiento', color: '#6B67FF' },
  { label: 'Depreciación', color: '#3b82f6' },
  { label: 'Seguros', color: '#f59e0b' },
  { label: 'Parqueadero', color: '#9ca3af' },
];

@Component({
  selector: 'app-proforma-compare',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './proforma-compare.component.html',
})
export class ProformaCompareComponent {
  storage = inject(ProformaStorageService);
  state = inject(CalculatorStateService);
  private calc = inject(CostCalculationService);
  appStore = inject(AppStore);

  compareGridRef = viewChild<ElementRef>('compareGrid');
  downloadLoading = signal(false);

  selectedIds = signal<string[]>([]);

  selectedProformas = computed(() => {
    const ids = this.selectedIds();
    return this.storage.proformas().filter((p) => ids.includes(p.id));
  });

  /** Precomputed chart data per selected proforma (avoids per-change-detection recompute) */
  proformaCharts = computed(() =>
    this.selectedProformas().map((p) => ({
      id: p.id,
      breakdown: this.buildBreakdownChart(p),
      deprData: this.buildDeprData(p),
      deprOptions: this.buildDeprOptions(p),
      deprValues: { purchase: p.vehicle.purchasePrice, current: p.vehicle.vehicleValue, residual: p.vehicle.residualValue },
      legend: this.buildLegend(p),
    }))
  );

  readonly breakdownChartOptions = {
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed.toFixed(1)}%` } },
    },
    animation: { duration: 0 },
  };

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  toggleSelect(id: string): void {
    this.selectedIds.update((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      if (ids.length >= 3) return ids;
      return [...ids, id];
    });
  }

  deleteProforma(id: string, event: Event): void {
    event.stopPropagation();
    this.selectedIds.update((ids) => ids.filter((x) => x !== id));
    this.storage.delete(id);
  }

  breakdownRowsFor(p: SavedProforma): BreakdownRow[] {
    const r = p.result;
    return [
      { label: 'Combustible', icon: 'pi-bolt', perKm: r.fuelPerKm + r.idlePerKm, color: '#443FE9' },
      { label: 'Mantenimiento', icon: 'pi-wrench', perKm: r.maintPerKm, color: '#6B67FF' },
      { label: 'Depreciación', icon: 'pi-chart-line', perKm: r.deprPerKm, color: '#3b82f6' },
      { label: 'Seguros', icon: 'pi-shield', perKm: r.insurePerKm, color: '#f59e0b' },
      { label: 'Parqueadero', icon: 'pi-map-marker', perKm: r.parkPerKm, color: '#9ca3af' },
    ];
  }

  pct(perKm: number, result: CostBreakdown): number {
    return Math.min((perKm / (result.totalPerKm || 1)) * 100, 100);
  }

  loadConfig(p: SavedProforma): void {
    this.state.loadProforma(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async downloadComparison(): Promise<void> {
    const el = this.compareGridRef()?.nativeElement;
    if (!el) return;
    this.downloadLoading.set(true);
    try {
      const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: '#f9fafb' });
      const link = document.createElement('a');
      link.download = 'comparacion-vehiculos.png';
      link.href = dataUrl;
      link.click();
    } finally {
      this.downloadLoading.set(false);
    }
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  }

  iconBg: Record<string, string> = {
    'pi-bolt': 'rgba(68,63,233,0.1)',
    'pi-wrench': 'rgba(107,103,255,0.12)',
    'pi-chart-line': 'rgba(59,130,246,0.1)',
    'pi-shield': 'rgba(245,158,11,0.1)',
    'pi-map-marker': 'rgba(107,114,128,0.1)',
  };

  cardHeaderBg(p: SavedProforma): string {
    if (p.vehicle.isElectric) return '#0a5276';
    if (p.vehicle.vehicleType === 'motorcycle') return '#7f1d1d';
    return '#0F0F0F';
  }

  specsFor(p: SavedProforma): string {
    const v = p.vehicle;
    const isMoto = v.vehicleType === 'motorcycle';
    const parts: string[] = [];
    if (isMoto) parts.push('Moto');
    if (v.isElectric) parts.push('Elec');
    else {
      if (v.engineDisplacement) parts.push(isMoto ? `${v.engineDisplacement}cc` : `${v.engineDisplacement}L`);
      if (v.turbo && !isMoto) parts.push('T');
    }
    parts.push(v.transmission === 'manual' ? 'MT' : 'AT');
    if (v.vehicleYear) parts.push(String(v.vehicleYear));
    return parts.join(' · ');
  }

  // ── chart builders ────────────────────────────────────────────────────────

  private buildBreakdownChart(p: SavedProforma) {
    const r = p.result;
    const vals = [r.fuelPerKm + r.idlePerKm, r.maintPerKm, r.deprPerKm, r.insurePerKm, r.parkPerKm];
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    return {
      labels: CATEGORIES.map((c) => c.label),
      datasets: [{
        data: vals.map((v) => parseFloat(((v / total) * 100).toFixed(1))),
        backgroundColor: CATEGORIES.map((c) => c.color),
        borderWidth: 0,
      }],
    };
  }

  private buildLegend(p: SavedProforma) {
    const r = p.result;
    const vals = [r.fuelPerKm + r.idlePerKm, r.maintPerKm, r.deprPerKm, r.insurePerKm, r.parkPerKm];
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    return CATEGORIES.map((c, i) => ({
      label: c.label,
      color: c.color,
      pct: ((vals[i] / total) * 100).toFixed(1),
    }));
  }

  private buildDeprData(p: SavedProforma) {
    const curve = this.calc.buildDepreciationCurve(p.vehicle);
    const labels = curve.map((pt) => String(pt.year));
    const currentIdx = curve.findIndex((pt) => pt.year === CURRENT_YEAR);
    const pastData = curve.map((pt, i) => (i <= currentIdx ? pt.value : null));
    const futureData = curve.map((pt, i) => (i >= currentIdx ? pt.value : null));
    return {
      labels,
      datasets: [
        {
          label: 'Pasado', data: pastData,
          borderColor: '#9ca3af', borderWidth: 1.5, borderDash: [4, 4],
          pointRadius: 2, pointBackgroundColor: '#9ca3af',
          fill: false, tension: 0.3, spanGaps: false,
        },
        {
          label: 'Proyección', data: futureData,
          borderColor: '#443FE9', borderWidth: 1.5,
          pointRadius: 2, pointBackgroundColor: '#443FE9',
          backgroundColor: 'rgba(68,63,233,0.06)', fill: true,
          tension: 0.3, spanGaps: false,
        },
      ],
    };
  }

  private buildDeprOptions(p: SavedProforma) {
    const sym = p.currencySymbol;
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => ` ${sym}${ctx.parsed.y.toLocaleString('es-EC')}` } },
      },
      scales: {
        x: { ticks: { color: '#9ca3af', font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        y: {
          ticks: {
            color: '#9ca3af', font: { size: 9 },
            callback: (v: number) => `${sym}${(v / 1000).toFixed(0)}k`,
          },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
      },
      animation: { duration: 0 },
    };
  }
}
