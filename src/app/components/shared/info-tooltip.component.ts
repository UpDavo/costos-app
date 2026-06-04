import { Component, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-info-tip',
  imports: [TooltipModule],
  template: `
    <button
      class="info-btn"
      type="button"
      [pTooltip]="text()"
      tooltipPosition="top"
      [tooltipOptions]="{ showDelay: 80, hideDelay: 80 }"
    >
      <i class="pi pi-info-circle"></i>
    </button>
  `,
  styles: [`
    .info-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 2px;
      border-radius: 50%;
      transition: color 0.15s, background 0.15s;
      vertical-align: middle;
      margin-left: 4px;
      line-height: 1;
    }
    .info-btn:hover {
      color: var(--primary, #2d6a4f);
      background: var(--primary-dim, rgba(45,106,79,0.08));
    }
    .info-btn .pi {
      font-size: 0.78rem;
    }
  `],
})
export class InfoTooltipComponent {
  text = input.required<string>();
}
