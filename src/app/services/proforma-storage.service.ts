import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SavedProforma } from '../models/calculator.model';

const STORAGE_KEY = 'costos-app-proformas';
const MAX_PROFORMAS = 5;

@Injectable({ providedIn: 'root' })
export class ProformaStorageService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  proformas = signal<SavedProforma[]>([]);
  isFull = computed(() => this.proformas().length >= MAX_PROFORMAS);
  maxCount = MAX_PROFORMAS;

  constructor() {
    this.load();
  }

  private load(): void {
    if (!this.isBrowser) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.proformas.set(JSON.parse(raw));
    } catch {
      // corrupted storage — ignore
    }
  }

  private persist(): void {
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.proformas()));
    }
  }

  save(data: Omit<SavedProforma, 'id' | 'savedAt'>): SavedProforma | null {
    if (this.isFull()) return null;
    const entry: SavedProforma = {
      ...data,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    };
    this.proformas.update((p) => [...p, entry]);
    this.persist();
    return entry;
  }

  delete(id: string): void {
    this.proformas.update((p) => p.filter((x) => x.id !== id));
    this.persist();
  }
}
