import { Component, inject } from '@angular/core';
import { AppStore } from '../../store/app.store';

@Component({
  selector: 'app-locale-pill',
  imports: [],
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
      gap: 0;
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
  `],
})
export class LocalePillComponent {
  appStore = inject(AppStore);
}
