import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { CalculatorStateService } from '../../services/calculator-state.service';
import { AppStore } from '../../store/app.store';
import { MAKE_NAMES, getModelsForMake } from '../../data/vehicle-catalog';
import { SearchableSelectComponent } from '../shared/searchable-select.component';
import type { CommunityVehicle } from '../../models/calculator.model';

@Component({
  selector: 'app-community-search',
  imports: [CommonModule, DatePipe, FormsModule, SearchableSelectComponent],
  templateUrl: './community-search.component.html',
})
export class CommunitySearchComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private state = inject(CalculatorStateService);
  appStore = inject(AppStore);

  makes = MAKE_NAMES;
  selectedMake = signal('');
  selectedModel = signal('');
  models = computed(() => getModelsForMake(this.selectedMake()));

  isOpen = signal(false);
  recent = signal<CommunityVehicle[]>([]);
  results = signal<CommunityVehicle[]>([]);
  loading = signal(false);
  error = signal('');
  applied = signal<string | null>(null);

  async ngOnInit() {
    await this.loadRecent();
  }

  openModal() {
    this.isOpen.set(true);
  }

  closeModal() {
    this.isOpen.set(false);
    this.selectedMake.set('');
    this.selectedModel.set('');
    this.results.set([]);
    this.error.set('');
  }

  private async loadRecent() {
    try {
      const data = await this.supabase.getRecent(this.appStore.selectedCountry().code, 8);
      this.recent.set(data);
    } catch {
      // silently fail
    }
  }

  onMakeChange(make: string) {
    this.selectedMake.set(make);
    this.selectedModel.set('');
    if (make) this.doSearch();
    else this.results.set([]);
  }

  onModelChange(model: string) {
    this.selectedModel.set(model);
    this.doSearch();
  }

  private async doSearch() {
    const make = this.selectedMake();
    if (!make) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const data = await this.supabase.search(
        this.appStore.selectedCountry().code,
        make,
        this.selectedModel() || undefined,
      );
      this.results.set(data);
    } catch {
      this.error.set('No se pudo cargar la comunidad.');
    } finally {
      this.loading.set(false);
    }
  }

  async applyConfig(entry: CommunityVehicle) {
    this.state.patchVehicle({ ...entry.vehicle });
    this.state.patchFuel(entry.fuel);
    this.state.idle.set({ ...entry.idle });
    this.state.obligations.set({ ...entry.obligations });
    this.state.maintenanceItems.set([...entry.maintenance_items]);
    this.applied.set(entry.id);
    try { await this.supabase.incrementUses(entry.id); } catch { /* ignore */ }
    setTimeout(() => {
      this.applied.set(null);
      this.closeModal();
    }, 1200);
  }

  fuelLabel(entry: CommunityVehicle): string {
    if (entry.vehicle.isElectric) return 'Eléctrico';
    return entry.fuel.type.charAt(0).toUpperCase() + entry.fuel.type.slice(1);
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).dataset['backdrop'] === 'true') {
      this.closeModal();
    }
  }
}
