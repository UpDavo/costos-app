import { Component, input, signal, HostListener, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'app-info-tip',
  template: `
    <span class="info-wrap">
      <button
        class="info-btn"
        type="button"
        (click)="onTap($event)"
        (mouseenter)="open.set(true)"
        (mouseleave)="open.set(false)"
        aria-label="Más información"
      >
        <i class="pi pi-info-circle"></i>
      </button>
      @if (open()) {
        <span class="tip-box">{{ text() }}</span>
      }
    </span>
  `,
  styles: [`
    .info-wrap {
      position: relative;
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
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
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
    }
  `],
})
export class InfoTooltipComponent {
  text = input.required<string>();
  open = signal(false);
  private el = inject(ElementRef);

  onTap(e: MouseEvent) {
    e.stopPropagation();
    this.open.update(v => !v);
  }

  @HostListener('document:click', ['$event.target'])
  onDocClick(target: HTMLElement) {
    if (!this.el.nativeElement.contains(target)) {
      this.open.set(false);
    }
  }
}
