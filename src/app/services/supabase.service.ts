import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { CommunityVehicle, FuelData, IdleData, MaintenanceItem, ObligationsData, VehicleData, CostBreakdown } from '../models/calculator.model';
import { environment } from '../../environments/environment';

const TABLE = 'community_vehicles';
const VIEW  = 'community_vehicles_latest';
const SAVE_COOLDOWN_MS = 60_000; // 1 save per minute per session

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
  private lastSaveAt = 0;

  async getRecent(countryCode: string, limit = 10): Promise<CommunityVehicle[]> {
    const { data, error } = await this.client
      .from(VIEW)
      .select('*')
      .eq('country_code', countryCode)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }

  async search(countryCode: string, make: string, model?: string): Promise<CommunityVehicle[]> {
    let query = this.client
      .from(VIEW)
      .select('*')
      .eq('country_code', countryCode)
      .ilike('make', make);
    if (model) query = query.ilike('model', `%${model}%`);
    const { data, error } = await query.order('uses', { ascending: false }).limit(20);
    if (error) throw error;
    return data ?? [];
  }

  async save(payload: {
    country_code: string;
    make: string;
    model: string;
    trim: string;
    year: number;
    vehicle: VehicleData;
    fuel: FuelData;
    idle: IdleData;
    obligations: ObligationsData;
    maintenance_items: MaintenanceItem[];
    result: CostBreakdown;
  }): Promise<void> {
    const now = Date.now();
    if (now - this.lastSaveAt < SAVE_COOLDOWN_MS) {
      throw new Error('Espera un momento antes de compartir de nuevo.');
    }
    const { error } = await this.client.from(TABLE).insert(payload);
    if (error) throw error;
    this.lastSaveAt = now;
  }

  async incrementUses(vehicleId: string): Promise<void> {
    const { error } = await this.client
      .from('vehicle_use_events')
      .insert({ vehicle_id: vehicleId });
    if (error) throw error;
  }
}
