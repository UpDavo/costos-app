import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { AppStore } from '../../store/app.store';
import { MaintenanceItemComponent } from './maintenance-item/maintenance-item.component';

@Component({
  selector: 'app-maintenance-card',
  imports: [CommonModule, FormsModule, InputNumberModule, InputTextModule, MaintenanceItemComponent],
  templateUrl: './maintenance-card.component.html',
})
export class MaintenanceCardComponent {
  state = inject(CalculatorStateService);
  appStore = inject(AppStore);
  showDialog = signal(false);
  newName = '';
  newCost = 50;
  newEvery = 10000;

  electricSchedule = computed(() => {
    const v = this.state.vehicle();
    const base = v.electricMaintCost || 0;
    const every = v.electricMaintEvery || 20000;
    const totalKm = v.annualKm * v.usefulLife;
    const purchaseKm = v.purchaseKm || 0;
    if (base <= 0 || every <= 0 || totalKm <= 0) return [];
    const offset = purchaseKm % every;
    const firstDue = offset === 0 ? every : every - offset;
    const events: { km: number; cost: number; isPremium: boolean }[] = [];
    let km = firstDue;
    while (km <= totalKm && events.length < 8) {
      const eventNum = (purchaseKm + km) / every;
      const isPremium = eventNum % 2 === 0;
      events.push({ km, cost: isPremium ? base * 2 : base, isPremium });
      km += every;
    }
    return events;
  });

  addItem() {
    if (this.newName.trim()) {
      this.state.addMaintenanceItem(this.newName.trim(), this.newCost, this.newEvery);
      this.closeDialog();
    }
  }

  closeDialog() {
    this.showDialog.set(false);
    this.newName = '';
    this.newCost = 50;
    this.newEvery = 10000;
  }
}
