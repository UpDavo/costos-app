import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { AppStore } from '../../store/app.store';
import { MaintenanceItemComponent } from './maintenance-item/maintenance-item.component';

@Component({
  selector: 'app-maintenance-card',
  imports: [FormsModule, InputNumberModule, InputTextModule, MaintenanceItemComponent],
  templateUrl: './maintenance-card.component.html',
})
export class MaintenanceCardComponent {
  state = inject(CalculatorStateService);
  appStore = inject(AppStore);
  showDialog = signal(false);
  newName = '';
  newCost = 50;
  newEvery = 10000;

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
