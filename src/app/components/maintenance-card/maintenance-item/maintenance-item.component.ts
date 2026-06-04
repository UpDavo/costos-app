import { Component, input, output, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { MaintenanceItem } from '../../../models/calculator.model';

@Component({
  selector: 'app-maintenance-item',
  imports: [CommonModule, DecimalPipe, FormsModule, InputNumberModule, ToggleSwitchModule, TooltipModule],
  templateUrl: './maintenance-item.component.html',
})
export class MaintenanceItemComponent {
  item = input.required<MaintenanceItem>();
  currencySymbol = input<string>('$');
  currencyCode = input<string>('USD');
  enabledChange = output<boolean>();
  costChange = output<number>();
  everyChange = output<number>();
  remove = output<void>();

  costPerKm = computed(() => {
    const i = this.item();
    if (!i.enabled || i.every <= 0) return 0;
    return i.cost / i.every;
  });
}
