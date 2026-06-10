import { Component, input, signal, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-tip',
  imports: [CommonModule],
  template: `
    <span class="info-wrap">
      <button
        class="info-btn"
        type="button"
        (click)="onTap($event)"
        (mouseenter)="showAt($event)"
        (mouseleave)="open.set(false)"
        aria-label="Más información"
      >
        <i class="pi pi-info-circle"></i>
      </button>
    </span>

    @if (open()) {
      <div
        class="tip-box"
        [style.top.px]="tipY()"
        [style.left.px]="tipX()">
        {{ text() }}
      </div>
    }
  `,
  styles: [`
    .info-wrap {
      display: inline-flex;
      align-items: center;
    }
    .info-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 4px;
      border-radius: 50%;
      transition: color 0.15s, background 0.15s;
      vertical-align: middle;
      margin-left: 4px;
      line-height: 1;
      -webkit-tap-highlight-color: transparent;
    }
    .info-btn:hover { color: var(--primary, #443FE9); background: var(--primary-dim, rgba(68,63,233,0.08)); }
    .info-btn .pi { font-size: 0.78rem; }
    .tip-box {
      position: fixed;
      background: #1e1e2e;
      color: #e5e7eb;
      font-size: 0.72rem;
      line-height: 1.45;
      padding: 7px 10px;
      border-radius: 4px;
      width: max-content;
      max-width: min(260px, 80vw);
      box-shadow: 0 4px 14px rgba(0,0,0,0.35);
      z-index: 9999;
      pointer-events: none;
      white-space: normal;
      transform: translate(-50%, -100%);
    }
  `],
})
export class InfoTooltipComponent {
  text = input.required<string>();
  open = signal(false);
  tipX = signal(0);
  tipY = signal(0);
  private el = inject(ElementRef);

  showAt(e: MouseEvent) {
    const btn = (e.target as HTMLElement).closest('button') ?? (e.target as HTMLElement);
    const rect = btn.getBoundingClientRect();
    this.tipX.set(rect.left + rect.width / 2);
    this.tipY.set(rect.top - 8);
    this.open.set(true);
  }

  onTap(e: MouseEvent) {
    e.stopPropagation();
    if (this.open()) {
      this.open.set(false);
    } else {
      this.showAt(e);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (!this.el.nativeElement.contains(e.target as Node)) {
      this.open.set(false);
    }
  }
}
