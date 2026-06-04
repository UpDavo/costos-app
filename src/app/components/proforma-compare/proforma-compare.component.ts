import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProformaStorageService } from '../../services/proforma-storage.service';
import { SavedProforma, CostBreakdown } from '../../models/calculator.model';

interface BreakdownRow { label: string; icon: string; perKm: number; color: string; }

@Component({
  selector: 'app-proforma-compare',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proforma-compare.component.html',
})
export class ProformaCompareComponent {
  storage = inject(ProformaStorageService);

  selectedIds = signal<string[]>([]);

  selectedProformas = computed(() => {
    const ids = this.selectedIds();
    return this.storage.proformas().filter((p) => ids.includes(p.id));
  });

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

  specsFor(p: SavedProforma): string {
    const v = p.vehicle;
    const parts: string[] = [];
    if (v.isElectric) parts.push('⚡');
    else {
      if (v.engineDisplacement) parts.push(`${v.engineDisplacement}L`);
      if (v.turbo) parts.push('T');
    }
    parts.push(v.transmission === 'manual' ? 'MT' : 'AT');
    if (v.vehicleYear) parts.push(String(v.vehicleYear));
    return parts.join(' · ');
  }
}
