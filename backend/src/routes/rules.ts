import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RulesService } from '../services/rulesService';

const router = Router();
const rulesService = new RulesService();

// Zod schema for creating/updating a rule
const CreateRuleSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['digital', 'physical', 'custom']),
  fee_type: z.enum(['percentage', 'fixed']),
  fee_value: z.number().positive().max(10000),
  is_active: z.boolean().optional(),
});

const UpdateRuleSchema = CreateRuleSchema.partial();

// GET /api/rules — list all rules for this merchant
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = await rulesService.getRules(req.instanceId!);
    res.json({ rules });
  } catch (err) {
    next(err);
  }
});

// GET /api/rules/:id — get single rule
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rule = await rulesService.getRuleById(req.instanceId!, req.params.id);
    if (!rule) {
      res.status(404).json({ error: 'Rule not found' });
      return;
    }
    res.json({ rule });
  } catch (err) {
    next(err);
  }
});

// POST /api/rules — create a new rule
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = CreateRuleSchema.parse(req.body);
    const rule = await rulesService.createRule(req.instanceId!, dto);
    res.status(201).json({ rule });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/rules/:id — update a rule
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = UpdateRuleSchema.parse(req.body);
    const rule = await rulesService.updateRule(req.instanceId!, req.params.id, dto);
    res.json({ rule });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/rules/:id — delete a rule
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rulesService.deleteRule(req.instanceId!, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;