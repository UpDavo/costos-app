import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStore } from '../../store/app.store';
import { CalculatorStateService } from '../../services/calculator-state.service';

@Component({
  selector: 'app-locale-pill',
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-[1000] flex flex-col items-end gap-[6px] select-none">

      <!-- Vehicle type badge -->
      @if (state.vehicleSpecsBadge()) {
        <div class="flex items-center gap-[5px] px-[12px] py-[5px]
                    text-[0.68rem] font-mono font-semibold tracking-[0.03em]
                    border-[1.5px] shadow-[0_2px_8px_rgba(68,63,233,0.12)]"
             [ngClass]="state.isElectric()
               ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
               : 'bg-white text-[var(--text)] border-[var(--border)]'">
          @if (state.isElectric()) {
            <i class="pi pi-bolt text-[0.68rem]"></i>
          } @else {
            <i class="pi pi-car text-[0.68rem] opacity-60"></i>
          }
          <span>{{ state.vehicleSpecsBadge() }}</span>
        </div>
      }

      <!-- Locale + save badge -->
      <div class="flex items-center
                  bg-white border-[1.5px] border-[var(--border)]
                  py-[6px] px-[14px]
                  shadow-[0_2px_8px_rgba(68,63,233,0.12),0_1px_3px_rgba(0,0,0,0.08)]
                  text-[0.75rem] font-mono font-semibold text-[var(--primary)] tracking-[0.02em]">

        <span class="flex items-center gap-[5px]">
          <i class="pi pi-map-marker text-[0.7rem] opacity-75"></i>
          {{ appStore.selectedCountry().name }}
        </span>

        <span class="w-px h-3 bg-[var(--border)] mx-[10px]"></span>

        <span class="flex items-center gap-[5px]">
          <i class="pi pi-wallet text-[0.7rem] opacity-75"></i>
          {{ appStore.selectedCountry().currency }}
        </span>

        <span class="w-px h-3 bg-[var(--border)] mx-[10px]"></span>

        <span class="flex items-center gap-[5px] transition-colors duration-200"
              [class]="state.saveStatus() === 'saving' ? 'text-[#9ca3af]' : 'text-[var(--primary-light)]'">
          @if (state.saveStatus() === 'saving') {
            <i class="pi pi-spin pi-spinner text-[0.7rem]"></i>
            <span>Guardando</span>
          } @else {
            <i class="pi pi-check-circle text-[0.7rem]"></i>
            <span>Guardado</span>
          }
        </span>
      </div>
    </div>
  `,
})
export class LocalePillComponent {
  appStore = inject(AppStore);
  state = inject(CalculatorStateService);
}
