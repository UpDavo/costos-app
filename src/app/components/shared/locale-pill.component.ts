import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStore } from '../../store/app.store';
import { CalculatorStateService } from '../../services/calculator-state.service';

@Component({
  selector: 'app-locale-pill',
  imports: [CommonModule],
  template: `
    <div class="locale-pill">
      <span class="locale-pill__segment">
        <i class="pi pi-map-marker"></i>
        {{ appStore.selectedCountry().name }}
      </span>
      <span class="locale-pill__divider"></span>
      <span class="locale-pill__segment">
        <i class="pi pi-wallet"></i>
        {{ appStore.selectedCountry().currency }}
      </span>
      <span class="locale-pill__divider"></span>
      <span class="locale-pill__segment locale-pill__save"
            [class.locale-pill__save--saving]="state.saveStatus() === 'saving'">
        @if (state.saveStatus() === 'saving') {
          <i class="pi pi-spin pi-spinner"></i>
          <span>Guardando</span>
        } @else {
          <i class="pi pi-check-circle"></i>
          <span>Guardado</span>
        }
      </span>
    </div>
  `,
  styles: [`
    .locale-pill {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: 1000;
      display: flex;
      align-items: center;
      background: #fff;
      border: 1.5px solid #c8d9d1;
      border-radius: 999px;
      padding: 6px 14px;
      box-shadow: 0 2px 8px rgba(45,106,79,0.12), 0 1px 3px rgba(0,0,0,0.08);
      font-size: 0.75rem;
      font-weight: 600;
      color: #2d6a4f;
      letter-spacing: 0.02em;
      user-select: none;
    }

    .locale-pill__segment {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .locale-pill__segment i {
      font-size: 0.7rem;
      opacity: 0.75;
    }

    .locale-pill__divider {
      width: 1px;
      height: 12px;
      background: #c8d9d1;
      margin: 0 10px;
    }

    .locale-pill__save {
      color: #52b788;
      transition: color 0.2s;
    }

    .locale-pill__save--saving {
      color: #9ca3af;
    }

    .locale-pill__save i {
      opacity: 1;
    }
  `],
})
export class LocalePillComponent {
  appStore = inject(AppStore);
  state = inject(CalculatorStateService);
}
