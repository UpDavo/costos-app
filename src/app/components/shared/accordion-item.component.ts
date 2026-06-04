import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionGroupComponent } from './accordion-group.component';
import { InfoTooltipComponent } from './info-tooltip.component';

@Component({
  selector: 'app-accordion-item',
  imports: [CommonModule, InfoTooltipComponent],
  template: `
    <div class="bg-white border border-[var(--border)] mb-4
                shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]
                overflow-hidden">

      <button
        type="button"
        (click)="group.toggle(index())"
        class="w-full flex items-center gap-2 px-5 py-4
               text-[0.7rem] font-mono font-semibold tracking-widest uppercase text-[var(--primary)]
               cursor-pointer bg-transparent border-0 text-left
               hover:bg-[var(--surface2)] transition-colors duration-150">
        <i class="pi {{ icon() }} text-[0.8rem] shrink-0"></i>
        <span class="flex-1">{{ title() }}</span>
        @if (tip()) {
          <app-info-tip [text]="tip()" />
        }
        <i class="pi pi-chevron-down text-[0.65rem] transition-transform duration-200 shrink-0"
           [class.rotate-180]="isOpen()"></i>
      </button>

      <div class="grid transition-all duration-300 ease-in-out"
           [class]="isOpen() ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
        <div class="overflow-hidden">
          <div class="border-t border-[var(--border)]">
            <ng-content />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AccordionItemComponent {
  group = inject(AccordionGroupComponent);
  index = input.required<number>();
  title = input.required<string>();
  icon = input<string>('');
  tip = input<string>('');

  isOpen = computed(() => this.group.openIndex() === this.index());
}
