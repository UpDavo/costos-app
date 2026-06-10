import {
  Component, input, output, signal, computed,
  HostListener, ElementRef, inject, model,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-searchable-select',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <!-- Trigger -->
      <button
        type="button"
        class="w-full flex items-center justify-between bg-white border-[1.5px] px-3 py-[9px] text-[0.875rem] cursor-pointer text-left transition-colors duration-150 focus:outline-none"
        [ngClass]="open() ? 'border-[var(--primary)]' : 'border-[var(--border2)]'"
        [disabled]="disabled()"
        (click)="toggle()">
        <span [ngClass]="value() ? 'text-[var(--text)]' : 'text-[var(--muted)]'">
          {{ value() || placeholder() }}
        </span>
        <i class="pi pi-chevron-down text-[0.65rem] text-[var(--muted)] transition-transform duration-150 flex-shrink-0 ml-2"
           [ngClass]="open() ? 'rotate-180' : ''"></i>
      </button>

      <!-- Dropdown -->
      @if (open()) {
        <div class="absolute z-50 top-full left-0 right-0 mt-[2px] bg-white border-[1.5px] border-[var(--primary)] shadow-lg max-h-[240px] flex flex-col">
          <!-- Search input -->
          <div class="p-2 border-b border-[var(--border2)]">
            <input
              #searchInput
              type="text"
              class="w-full px-3 py-[6px] text-[0.82rem] border-[1.5px] border-[var(--border2)] focus:outline-none focus:border-[var(--primary)]"
              [placeholder]="'Buscar ' + placeholder()"
              [ngModel]="query()"
              (ngModelChange)="query.set($event)"
              (click)="$event.stopPropagation()" />
          </div>
          <!-- Options -->
          <div class="overflow-y-auto flex-1">
            @if (filtered().length === 0) {
              <div class="px-3 py-3 text-[0.78rem] text-[var(--muted)]">Sin resultados</div>
            }
            @for (opt of filtered(); track opt) {
              <button
                type="button"
                class="w-full text-left px-3 py-[8px] text-[0.85rem] cursor-pointer transition-colors duration-100 hover:bg-[var(--primary-dim)] hover:text-[var(--primary)]"
                [ngClass]="opt === value() ? 'bg-[var(--primary-dim)] text-[var(--primary)] font-medium' : 'text-[var(--text)]'"
                (click)="select(opt)">
                {{ opt }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SearchableSelectComponent {
  options = input.required<string[]>();
  placeholder = input('Selecciona');
  disabled = input(false);
  value = model<string>('');

  open = signal(false);
  query = signal('');
  private el = inject(ElementRef);

  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    return q ? this.options().filter(o => o.toLowerCase().includes(q)) : this.options();
  });

  toggle() {
    this.open.update(v => !v);
    if (this.open()) this.query.set('');
  }

  select(opt: string) {
    this.value.set(opt);
    this.open.set(false);
    this.query.set('');
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (!this.el.nativeElement.contains(e.target as Node)) {
      this.open.set(false);
    }
  }
}
