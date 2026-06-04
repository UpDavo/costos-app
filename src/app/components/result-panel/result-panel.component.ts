import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { PdfReportService } from '../../services/pdf-report.service';
import { PdfReportData } from '../../models/calculator.model';
import { AppStore } from '../../store/app.store';
import { BreakdownChartComponent } from './breakdown-chart/breakdown-chart.component';
import { DepreciationChartComponent } from './depreciation-chart/depreciation-chart.component';

interface BreakdownRow { label: string; icon: string; perKm: number; color: string; }

@Component({
  selector: 'app-result-panel',
  imports: [
    CommonModule, FormsModule, DialogModule, ButtonModule,
    InputTextModule, TextareaModule, TooltipModule,
    BreakdownChartComponent, DepreciationChartComponent,
  ],
  templateUrl: './result-panel.component.html',
})
export class ResultPanelComponent {
  state = inject(CalculatorStateService);
  appStore = inject(AppStore);
  private pdfService = inject(PdfReportService);

  showPdf = signal(false);

  pdf: PdfReportData = {
    brand: '', model: '', color: '', plate: '', engine: '',
    transmission: '', currentKm: '', owner: '', cedula: '', uso: '', notes: '',
  };

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

  generatePdf() {
    this.showPdf.set(false);
    this.pdfService.generate(
      this.pdf,
      this.state.vehicle(),
      this.state.fuel(),
      this.state.obligations(),
      this.state.result(),
      this.state.maintenanceItems()
    );
  }
}
