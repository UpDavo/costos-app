import { Injectable } from '@angular/core';
import { CostBreakdown, MaintenanceItem, PdfReportData, VehicleData, FuelData, ObligationsData } from '../models/calculator.model';

@Injectable({ providedIn: 'root' })
export class PdfReportService {
  generate(
    report: PdfReportData,
    vehicle: VehicleData,
    fuel: FuelData,
    obligations: ObligationsData,
    breakdown: CostBreakdown,
    items: MaintenanceItem[]
  ) {
    const dateStr = new Date().toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const fuelTypeLabel = { extra: 'Extra / Ecopaís', super: 'Súper 95', diesel: 'Diésel' }[fuel.type];
    const rendUnit = fuel.unit === 'kmL' ? 'km/litro' : 'km/galón';
    const annualKm = vehicle.annualKm;

    const maintRows = items
      .filter((i) => i.enabled)
      .map(
        (i) => `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e8e8e8;font-size:0.8rem;">${i.name}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e8e8e8;font-size:0.8rem;text-align:right;">$${i.cost.toFixed(2)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e8e8e8;font-size:0.8rem;text-align:right;">c/ ${i.every.toLocaleString('es-EC')} km</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e8e8e8;font-size:0.8rem;text-align:right;color:#1a56a0;">$${(i.cost / i.every).toFixed(4)}/km</td>
      </tr>`
      )
      .join('');

    const rows = [
      { n: '⛽ Combustible', v: breakdown.fuelPerKm + breakdown.idlePerKm, c: '#c0392b' },
      { n: '🔧 Mantenimiento', v: breakdown.maintPerKm, c: '#1a56a0' },
      { n: '📉 Depreciación', v: breakdown.deprPerKm, c: '#b7770d' },
      { n: '🛡️ Seguros y matrícula', v: breakdown.insurePerKm, c: '#1a7a4a' },
      { n: '🅿️ Parqueadero', v: breakdown.parkPerKm, c: '#666' },
    ];

    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;background:#fff;max-width:100%;">
      <div style="background:#1a3a6e;padding:18px 24px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="color:#f0c060;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;">Reporte de Costo por Kilómetro · Ecuador</div>
          <div style="color:#fff;font-size:1.1rem;font-weight:700;line-height:1.2;">Análisis vehicular completo</div>
          <div style="color:#a8c4e8;font-size:0.72rem;margin-top:2px;">Generado el ${dateStr}</div>
        </div>
      </div>

      <div style="background:#f0c060;padding:12px 24px;display:flex;justify-content:space-around;align-items:center;">
        <div style="text-align:center;">
          <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.08em;color:#7a5a00;font-weight:600;">Costo por km</div>
          <div style="font-size:1.6rem;font-weight:800;color:#1a3a6e;line-height:1.1;">$${breakdown.totalPerKm.toFixed(3)}</div>
        </div>
        <div style="width:1px;height:36px;background:rgba(0,0,0,0.15);"></div>
        <div style="text-align:center;">
          <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.08em;color:#7a5a00;font-weight:600;">Costo anual</div>
          <div style="font-size:1.1rem;font-weight:700;color:#1a3a6e;">$${Math.round(breakdown.annualTotal).toLocaleString('es-EC')}</div>
        </div>
        <div style="width:1px;height:36px;background:rgba(0,0,0,0.15);"></div>
        <div style="text-align:center;">
          <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.08em;color:#7a5a00;font-weight:600;">Costo mensual</div>
          <div style="font-size:1.1rem;font-weight:700;color:#1a3a6e;">$${Math.round(breakdown.monthlyTotal).toLocaleString('es-EC')}</div>
        </div>
        <div style="width:1px;height:36px;background:rgba(0,0,0,0.15);"></div>
        <div style="text-align:center;">
          <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.08em;color:#7a5a00;font-weight:600;">Km anuales</div>
          <div style="font-size:1.1rem;font-weight:700;color:#1a3a6e;">${annualKm.toLocaleString('es-EC')}</div>
        </div>
      </div>

      <div style="padding:18px 24px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div style="border:1px solid #dde3ee;border-radius:8px;overflow:hidden;">
            <div style="background:#1a3a6e;color:#fff;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;padding:6px 12px;">Datos del vehículo</div>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;border-bottom:1px solid #f0f0f0;">Marca / Modelo</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;border-bottom:1px solid #f0f0f0;">${report.brand} ${report.model}</td></tr>
              <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;border-bottom:1px solid #f0f0f0;">Año</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;border-bottom:1px solid #f0f0f0;">${vehicle.vehicleYear}</td></tr>
              <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;border-bottom:1px solid #f0f0f0;">Color</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;border-bottom:1px solid #f0f0f0;">${report.color}</td></tr>
              <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;border-bottom:1px solid #f0f0f0;">Placa</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;border-bottom:1px solid #f0f0f0;">${report.plate}</td></tr>
              <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;border-bottom:1px solid #f0f0f0;">Motor</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;border-bottom:1px solid #f0f0f0;">${report.engine}</td></tr>
              <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;border-bottom:1px solid #f0f0f0;">Transmisión</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;border-bottom:1px solid #f0f0f0;">${report.transmission}</td></tr>
              <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;">Km actuales</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;">${report.currentKm}</td></tr>
            </table>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="border:1px solid #dde3ee;border-radius:8px;overflow:hidden;">
              <div style="background:#1a3a6e;color:#fff;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;padding:6px 12px;">Propietario</div>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;border-bottom:1px solid #f0f0f0;">Nombre</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;border-bottom:1px solid #f0f0f0;">${report.owner}</td></tr>
                <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;border-bottom:1px solid #f0f0f0;">Cédula / RUC</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;border-bottom:1px solid #f0f0f0;">${report.cedula}</td></tr>
                <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;">Uso principal</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;">${report.uso}</td></tr>
              </table>
            </div>
            <div style="border:1px solid #dde3ee;border-radius:8px;overflow:hidden;">
              <div style="background:#1a3a6e;color:#fff;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;padding:6px 12px;">Combustible</div>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;border-bottom:1px solid #f0f0f0;">Tipo</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;border-bottom:1px solid #f0f0f0;">${fuelTypeLabel}</td></tr>
                <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;border-bottom:1px solid #f0f0f0;">Precio</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;border-bottom:1px solid #f0f0f0;">$${fuel.pricePerGal.toFixed(3)}/gal</td></tr>
                <tr><td style="padding:5px 12px;font-size:0.75rem;color:#666;">Rendimiento</td><td style="padding:5px 12px;font-size:0.75rem;font-weight:600;">${fuel.rendimiento} ${rendUnit}</td></tr>
              </table>
            </div>
          </div>
        </div>

        <div style="border:1px solid #dde3ee;border-radius:8px;overflow:hidden;margin-bottom:16px;">
          <div style="background:#1a3a6e;color:#fff;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;padding:6px 12px;">Desglose de costos por kilómetro</div>
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#f5f7fc;">
              <th style="padding:7px 12px;font-size:0.72rem;text-align:left;color:#555;font-weight:600;border-bottom:2px solid #dde3ee;">Componente</th>
              <th style="padding:7px 12px;font-size:0.72rem;text-align:right;color:#555;font-weight:600;border-bottom:2px solid #dde3ee;">Costo/km</th>
              <th style="padding:7px 12px;font-size:0.72rem;text-align:right;color:#555;font-weight:600;border-bottom:2px solid #dde3ee;">Costo anual</th>
              <th style="padding:7px 12px;font-size:0.72rem;text-align:right;color:#555;font-weight:600;border-bottom:2px solid #dde3ee;">% del total</th>
            </tr></thead>
            <tbody>
              ${rows.map((r) => `<tr>
                <td style="padding:7px 12px;font-size:0.8rem;border-bottom:1px solid #f0f0f0;color:${r.c};font-weight:600;">${r.n}</td>
                <td style="padding:7px 12px;font-size:0.8rem;border-bottom:1px solid #f0f0f0;text-align:right;font-family:monospace;">$${r.v.toFixed(4)}</td>
                <td style="padding:7px 12px;font-size:0.8rem;border-bottom:1px solid #f0f0f0;text-align:right;font-family:monospace;">$${Math.round(r.v * annualKm).toLocaleString('es-EC')}</td>
                <td style="padding:7px 12px;font-size:0.8rem;border-bottom:1px solid #f0f0f0;text-align:right;">${breakdown.totalPerKm > 0 ? ((r.v / breakdown.totalPerKm) * 100).toFixed(1) : 0}%</td>
              </tr>`).join('')}
            </tbody>
            <tfoot><tr style="background:#1a3a6e;">
              <td style="padding:8px 12px;font-size:0.82rem;font-weight:700;color:#fff;">TOTAL</td>
              <td style="padding:8px 12px;font-size:0.82rem;font-weight:700;color:#f0c060;text-align:right;font-family:monospace;">$${breakdown.totalPerKm.toFixed(4)}</td>
              <td style="padding:8px 12px;font-size:0.82rem;font-weight:700;color:#f0c060;text-align:right;font-family:monospace;">$${Math.round(breakdown.annualTotal).toLocaleString('es-EC')}</td>
              <td style="padding:8px 12px;font-size:0.82rem;font-weight:700;color:#fff;text-align:right;">100%</td>
            </tr></tfoot>
          </table>
        </div>

        <div style="border:1px solid #dde3ee;border-radius:8px;overflow:hidden;margin-bottom:16px;">
          <div style="background:#1a3a6e;color:#fff;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;padding:6px 12px;">Ítems de mantenimiento incluidos</div>
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#f5f7fc;">
              <th style="padding:6px 10px;font-size:0.7rem;text-align:left;color:#555;border-bottom:2px solid #dde3ee;">Servicio</th>
              <th style="padding:6px 10px;font-size:0.7rem;text-align:right;color:#555;border-bottom:2px solid #dde3ee;">Costo</th>
              <th style="padding:6px 10px;font-size:0.7rem;text-align:right;color:#555;border-bottom:2px solid #dde3ee;">Frecuencia</th>
              <th style="padding:6px 10px;font-size:0.7rem;text-align:right;color:#555;border-bottom:2px solid #dde3ee;">Costo/km</th>
            </tr></thead>
            <tbody>${maintRows}</tbody>
          </table>
        </div>

        ${report.notes ? `<div style="border:1px solid #dde3ee;border-radius:8px;padding:10px 14px;margin-bottom:16px;background:#fffdf5;"><div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.08em;color:#b7770d;font-weight:700;margin-bottom:4px;">Observaciones</div><div style="font-size:0.8rem;color:#333;line-height:1.5;">${report.notes}</div></div>` : ''}
      </div>

      <div style="background:#f5f7fc;border-top:2px solid #dde3ee;padding:10px 24px;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:0.65rem;color:#888;">Herramienta de análisis vehicular · Ecuador ${new Date().getFullYear()}</div>
      </div>
    </div>`;

    const printDiv = document.getElementById('print-report')!;
    printDiv.innerHTML = html;
    window.print();
    setTimeout(() => {
      printDiv.innerHTML = '';
    }, 3000);
  }
}
