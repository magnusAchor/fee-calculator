export type FeeType = 'percentage' | 'fixed';
export type ProductCategory = 'digital' | 'physical' | 'custom';

export interface FeeRule {
  id: string;
  instance_id: string;
  name: string;
  category: ProductCategory;
  fee_type: FeeType;
  fee_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRuleDto {
  name: string;
  category: ProductCategory;
  fee_type: FeeType;
  fee_value: number;
  is_active?: boolean;
}

export interface UpdateRuleDto extends Partial<CreateRuleDto> {}

export interface CalculateFeeRequest {
  product_category: ProductCategory;
  product_price: number;
  quantity?: number;
}

export interface CalculateFeeResponse {
  original_price: number;
  total_fee: number;
  final_price: number;
  applied_rules: Array<{
    rule_id: string;
    rule_name: string;
    fee_applied: number;
  }>;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// Extends Express Request with Wix instance context
declare global {
  namespace Express {
    interface Request {
      instanceId?: string;
    }
  }
}