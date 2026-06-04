import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CalculatorStateService } from '../../../services/calculator-state.service';
import { AppStore } from '../../../store/app.store';
import { CURRENT_YEAR } from '../../../services/cost-calculation.service';

@Component({
  selector: 'app-depreciation-chart',
  imports: [CommonModule, ChartModule],
  templateUrl: './depreciation-chart.component.html',
})
export class DepreciationChartComponent {
  private stateService = inject(CalculatorStateService);
  appStore = inject(AppStore);

  purchasePrice = computed(() => this.stateService.vehicle().purchasePrice);
  vehicleValue = computed(() => this.stateService.vehicle().vehicleValue);
  residualValue = computed(() => this.stateService.vehicle().residualValue);

  chartOptions = computed(() => {
    const sym = this.appStore.selectedCountry().currencySymbol;
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => ` ${sym}${ctx.parsed.y.toLocaleString('es-EC')}` } },
      },
      scales: {
        x: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        y: {
          ticks: { color: '#9ca3af', font: { size: 10 }, callback: (v: number) => `${sym}${(v / 1000).toFixed(0)}k` },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
      },
      animation: { duration: 300 },
    };
  });

  chartData = computed(() => {
    const curve = this.stateService.depreciationCurve();
    const labels = curve.map(p => String(p.year));
    const currentIdx = curve.findIndex(p => p.year === CURRENT_YEAR);
    const pastData = curve.map((p, i) => (i <= currentIdx ? p.value : null));
    const futureData = curve.map((p, i) => (i >= currentIdx ? p.value : null));
    return {
      labels,
      datasets: [
        {
          label: 'Pasado', data: pastData,
          borderColor: '#9ca3af', borderWidth: 2, borderDash: [4, 4],
          pointRadius: 3, pointBackgroundColor: '#9ca3af',
          fill: false, tension: 0.3, spanGaps: false,
        },
        {
          label: 'Proyección', data: futureData,
          borderColor: '#443FE9', borderWidth: 2,
          pointRadius: 3, pointBackgroundColor: '#443FE9',
          backgroundColor: 'rgba(68,63,233,0.06)', fill: true,
          tension: 0.3, spanGaps: false,
        },
      ],
    };
  });
}
