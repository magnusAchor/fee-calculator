import { FeeRule, CalculateFeeRequest, CalculateFeeResponse } from '../types';

export class FeeCalculator {
  /**
   * Applies all matching active rules to the given product and
   * returns a full breakdown: original price, total fee, final price.
   */
  calculate(request: CalculateFeeRequest, rules: FeeRule[]): CalculateFeeResponse {
    const { product_price, quantity = 1 } = request;
    const linePrice = product_price * quantity;

    let totalFee = 0;
    const appliedRules: CalculateFeeResponse['applied_rules'] = [];

    for (const rule of rules) {
      let feeApplied = 0;

      if (rule.fee_type === 'percentage') {
        // e.g. fee_value = 5 → 5% of line price
        feeApplied = (linePrice * rule.fee_value) / 100;
      } else if (rule.fee_type === 'fixed') {
        // e.g. fee_value = 2.50 → flat $2.50 per item
        feeApplied = rule.fee_value * quantity;
      }

      // Round to 2 decimal places to avoid floating-point drift
      feeApplied = Math.round(feeApplied * 100) / 100;
      totalFee += feeApplied;

      appliedRules.push({
        rule_id: rule.id,
        rule_name: rule.name,
        fee_applied: feeApplied,
      });
    }

    totalFee = Math.round(totalFee * 100) / 100;

    return {
      original_price: linePrice,
      total_fee: totalFee,
      final_price: Math.round((linePrice + totalFee) * 100) / 100,
      applied_rules: appliedRules,
    };
  }
}