import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle',
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="checked()"
      class="relative inline-flex items-center shrink-0 w-9 h-5 border transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-dim)]"
      [class]="checked()
        ? 'bg-[var(--primary)] border-[var(--primary)]'
        : 'bg-[var(--surface2)] border-[var(--border2)]'"
      (click)="checkedChange.emit(!checked())">
      <span
        class="absolute top-[3px] w-3 h-3 bg-white transition-transform duration-150 shadow-sm"
        [class]="checked() ? 'translate-x-[17px]' : 'translate-x-[3px]'">
      </span>
    </button>
  `,
})
export class ToggleComponent {
  checked = input.required<boolean>();
  checkedChange = output<boolean>();
}
