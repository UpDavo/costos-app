import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { CommunityVehicle, FuelData, IdleData, MaintenanceItem, ObligationsData, VehicleData, CostBreakdown } from '../models/calculator.model';
import { environment } from '../../environments/environment';

const TABLE = 'community_vehicles';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);

  async getRecent(countryCode: string, limit = 10): Promise<CommunityVehicle[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select('*')
      .eq('country_code', countryCode)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }

  async search(countryCode: string, make: string, model?: string): Promise<CommunityVehicle[]> {
    let query = this.client
      .from(TABLE)
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
    const { error } = await this.client.from(TABLE).insert(payload);
    if (error) throw error;
  }

  async incrementUses(id: string): Promise<void> {
    const { error } = await this.client.rpc('increment_uses', { row_id: id });
    if (error) throw error;
  }
}
