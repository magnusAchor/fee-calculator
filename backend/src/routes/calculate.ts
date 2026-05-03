import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RulesService } from '../services/rulesService';
import { FeeCalculator } from '../services/feeCalculator';

const router = Router();
const rulesService = new RulesService();
const feeCalculator = new FeeCalculator();

const CalculateSchema = z.object({
  product_category: z.enum(['digital', 'physical', 'custom']),
  product_price: z.number().positive(),
  quantity: z.number().int().positive().optional().default(1),
});

// POST /api/calculate — compute fees for a product
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = CalculateSchema.parse(req.body);

    // Fetch only active rules matching the product's category
    const rules = await rulesService.getActiveRulesByCategory(
      req.instanceId!,
      input.product_category
    );

    const result = feeCalculator.calculate(input, rules);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;