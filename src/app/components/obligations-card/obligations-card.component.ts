import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { AppStore } from '../../store/app.store';
import { InfoTooltipComponent } from '../shared/info-tooltip.component';

@Component({
  selector: 'app-obligations-card',
  imports: [FormsModule, InputNumberModule, InfoTooltipComponent],
  templateUrl: './obligations-card.component.html',
})
export class ObligationsCardComponent {
  state = inject(CalculatorStateService);
  appStore = inject(AppStore);
}
