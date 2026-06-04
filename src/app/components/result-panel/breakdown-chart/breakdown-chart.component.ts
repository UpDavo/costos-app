import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CalculatorStateService } from '../../../services/calculator-state.service';

@Component({
  selector: 'app-breakdown-chart',
  imports: [CommonModule, ChartModule],
  templateUrl: './breakdown-chart.component.html',
})
export class BreakdownChartComponent {
  private state = inject(CalculatorStateService);

  chartOptions = {
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed.toFixed(1)}%` },
      },
    },
    animation: { duration: 300 },
  };

  private categories = [
    { label: 'Combustible', color: '#443FE9' },
    { label: 'Mantenimiento', color: '#6B67FF' },
    { label: 'Depreciación', color: '#3b82f6' },
    { label: 'Seguros', color: '#f59e0b' },
    { label: 'Parqueadero', color: '#9ca3af' },
  ];

  private values = computed(() => {
    const r = this.state.result();
    return [r.fuelPerKm + r.idlePerKm, r.maintPerKm, r.deprPerKm, r.insurePerKm, r.parkPerKm];
  });

  chartData = computed(() => {
    const vals = this.values();
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    return {
      labels: this.categories.map(c => c.label),
      datasets: [{
        data: vals.map(v => parseFloat(((v / total) * 100).toFixed(1))),
        backgroundColor: this.categories.map(c => c.color),
        borderWidth: 0,
      }],
    };
  });

  legendItems = computed(() => {
    const vals = this.values();
    const total = vals.reduce((a, b) => a + b, 0) || 1;
    return this.categories.map((c, i) => ({
      label: c.label,
      color: c.color,
      pct: ((vals[i] / total) * 100).toFixed(1),
    }));
  });
}
