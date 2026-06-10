import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { MAKE_NAMES, getModelsForMake } from '../../data/vehicle-catalog';
import { SearchableSelectComponent } from '../shared/searchable-select.component';

@Component({
  selector: 'app-vehicle-gate',
  imports: [CommonModule, FormsModule, SearchableSelectComponent],
  template: `
    <div class="fixed inset-0 z-40 flex items-center justify-center p-4"
         style="background: rgba(15,15,15,0.82); backdrop-filter: blur(2px);">
      <div class="w-full max-w-[420px] bg-white flex flex-col">

        <!-- Header -->
        <div class="bg-[#0F0F0F] px-6 py-5">
          <div class="text-[0.68rem] font-mono text-white/40 uppercase tracking-widest mb-1">Paso 1 de 1</div>
          <h2 class="text-[1.15rem] font-bold text-white tracking-tight">¿Qué vehículo tienes?</h2>
          <p class="text-[0.75rem] text-white/50 mt-1">Selecciona marca, modelo y versión para continuar.</p>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 flex flex-col gap-4">

          <div class="flex flex-col gap-[6px]">
            <label class="text-[0.75rem] text-[var(--muted)] font-medium uppercase tracking-wide">Marca</label>
            <app-searchable-select
              [options]="makes"
              placeholder="Selecciona marca"
              [(value)]="selectedMake" />
          </div>

          <div class="flex flex-col gap-[6px]">
            <label class="text-[0.75rem] text-[var(--muted)] font-medium uppercase tracking-wide">Modelo</label>
            <app-searchable-select
              [options]="models()"
              placeholder="Selecciona modelo"
              [disabled]="!selectedMake()"
              [(value)]="selectedModel" />
          </div>

          <div class="flex flex-col gap-[6px]">
            <label class="text-[0.75rem] text-[var(--muted)] font-medium uppercase tracking-wide flex items-center gap-2">
              Versión / variante
              <span class="text-[0.65rem] font-normal text-[var(--muted)] normal-case tracking-normal">(opcional)</span>
            </label>
            <input
              type="text"
              class="input-field text-[0.875rem]"
              [ngModel]="selectedTrim()"
              (ngModelChange)="selectedTrim.set($event)"
              placeholder="Ej: 4x4, XLT, 2.5 TDi, Sport…"
              [disabled]="!selectedModel()" />
          </div>

          <button
            type="button"
            class="w-full py-[11px] px-4 bg-[var(--primary)] text-white text-[0.85rem] font-semibold cursor-pointer border border-[var(--primary)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-150 flex items-center justify-center gap-2 mt-1"
            [disabled]="!canConfirm()"
            (click)="confirm()">
            <i class="pi pi-arrow-right"></i>
            Continuar al análisis
          </button>
        </div>
      </div>
    </div>
  `,
})
export class VehicleGateComponent {
  private state = inject(CalculatorStateService);

  makes = MAKE_NAMES;
  selectedMake = signal('');
  selectedModel = signal('');
  selectedTrim = signal('');

  models = computed(() => getModelsForMake(this.selectedMake()));
  canConfirm = computed(() => !!(this.selectedMake() && this.selectedModel()));

  confirm() {
    if (!this.canConfirm()) return;
    this.state.patchVehicle({
      make: this.selectedMake(),
      model: this.selectedModel(),
      trim: this.selectedTrim(),
    });
    this.state.gateCompleted.set(true);
  }
}
