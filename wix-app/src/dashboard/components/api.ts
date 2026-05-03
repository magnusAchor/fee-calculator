// All API calls to your Node.js backend.
// The Wix instance token is passed as Bearer for backend auth.

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

async function getInstanceToken(): Promise<string> {
  // In a Wix dashboard page, window.__WIX_INSTANCE__ is injected by the Wix runtime
  // It's a base64-encoded token containing instanceId and more
  const instance = (window as any).__WIX_INSTANCE__ as string;
  if (!instance) throw new Error('Wix instance token not found');
  return instance;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getInstanceToken();

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  // 204 No Content has no body
  if (response.status === 204) return undefined as T;

  return response.json();
}

// --- Rules API ---

export interface FeeRule {
  id: string;
  name: string;
  category: 'digital' | 'physical' | 'custom';
  fee_type: 'percentage' | 'fixed';
  fee_value: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateRulePayload {
  name: string;
  category: FeeRule['category'];
  fee_type: FeeRule['fee_type'];
  fee_value: number;
  is_active?: boolean;
}

export const getRules = () =>
  apiFetch<{ rules: FeeRule[] }>('/api/rules').then((r) => r.rules);

export const createRule = (payload: CreateRulePayload) =>
  apiFetch<{ rule: FeeRule }>('/api/rules', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((r) => r.rule);

export const updateRule = (id: string, payload: Partial<CreateRulePayload>) =>
  apiFetch<{ rule: FeeRule }>(`/api/rules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }).then((r) => r.rule);

export const deleteRule = (id: string) =>
  apiFetch<void>(`/api/rules/${id}`, { method: 'DELETE' });

// --- Calculate API ---

export interface CalculateResult {
  original_price: number;
  total_fee: number;
  final_price: number;
  applied_rules: Array<{
    rule_id: string;
    rule_name: string;
    fee_applied: number;
  }>;
}

export const calculateFee = (
  category: FeeRule['category'],
  price: number,
  quantity = 1
) =>
  apiFetch<CalculateResult>('/api/calculate', {
    method: 'POST',
    body: JSON.stringify({
      product_category: category,
      product_price: price,
      quantity,
    }),
  });