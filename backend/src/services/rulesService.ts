import { supabase } from '../config/supabase';
import { FeeRule, CreateRuleDto, UpdateRuleDto } from '../types';

export class RulesService {
  private table = 'fee_rules';

  async getRules(instanceId: string): Promise<FeeRule[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('instance_id', instanceId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch rules: ${error.message}`);
    return data as FeeRule[];
  }

  async getRuleById(instanceId: string, ruleId: string): Promise<FeeRule | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('instance_id', instanceId)
      .eq('id', ruleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch rule: ${error.message}`);
    }
    return data as FeeRule;
  }

  async createRule(instanceId: string, dto: CreateRuleDto): Promise<FeeRule> {
    const { data, error } = await supabase
      .from(this.table)
      .insert({
        instance_id: instanceId,
        name: dto.name,
        category: dto.category,
        fee_type: dto.fee_type,
        fee_value: dto.fee_value,
        is_active: dto.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create rule: ${error.message}`);
    return data as FeeRule;
  }

  async updateRule(
    instanceId: string,
    ruleId: string,
    dto: UpdateRuleDto
  ): Promise<FeeRule> {
    const { data, error } = await supabase
      .from(this.table)
      .update(dto)
      .eq('instance_id', instanceId)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update rule: ${error.message}`);
    return data as FeeRule;
  }

  async deleteRule(instanceId: string, ruleId: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('instance_id', instanceId)
      .eq('id', ruleId);

    if (error) throw new Error(`Failed to delete rule: ${error.message}`);
  }

  async getActiveRulesByCategory(
    instanceId: string,
    category: string
  ): Promise<FeeRule[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('instance_id', instanceId)
      .eq('category', category)
      .eq('is_active', true);

    if (error) throw new Error(`Failed to fetch active rules: ${error.message}`);
    return data as FeeRule[];
  }
}