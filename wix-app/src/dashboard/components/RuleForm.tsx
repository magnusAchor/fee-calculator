import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormField,
  Input,
  Dropdown,
  Toggle,
  Text,
  Loader,
} from '@wix/design-system';
import { FeeRule, CreateRulePayload, createRule, updateRule } from './api';

interface RuleFormProps {
  rule?: FeeRule | null;            // null = create mode, rule = edit mode
  onSaved: (rule: FeeRule) => void;
  onCancel: () => void;
}

const CATEGORY_OPTIONS = [
  { id: 'digital', value: 'digital', label: 'Digital' },
  { id: 'physical', value: 'physical', label: 'Physical' },
  { id: 'custom', value: 'custom', label: 'Custom' },
];

const FEE_TYPE_OPTIONS = [
  { id: 'percentage', value: 'percentage', label: 'Percentage (%)' },
  { id: 'fixed', value: 'fixed', label: 'Fixed amount ($)' },
];

export function RuleForm({ rule, onSaved, onCancel }: RuleFormProps) {
  const isEdit = Boolean(rule);

  const [name, setName] = useState(rule?.name ?? '');
  const [category, setCategory] = useState<FeeRule['category']>(rule?.category ?? 'physical');
  const [feeType, setFeeType] = useState<FeeRule['fee_type']>(rule?.fee_type ?? 'percentage');
  const [feeValue, setFeeValue] = useState(String(rule?.fee_value ?? ''));
  const [isActive, setIsActive] = useState(rule?.is_active ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Rule name is required';
    const numVal = parseFloat(feeValue);
    if (isNaN(numVal) || numVal <= 0) e.feeValue = 'Enter a positive number';
    if (feeType === 'percentage' && numVal > 100) e.feeValue = 'Percentage cannot exceed 100';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    setError(null);

    const payload: CreateRulePayload = {
      name: name.trim(),
      category,
      fee_type: feeType,
      fee_value: parseFloat(feeValue),
      is_active: isActive,
    };

    try {
      const saved = isEdit
        ? await updateRule(rule!.id, payload)
        : await createRule(payload);
      onSaved(saved);
    } catch (err: any) {
      setError(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box direction="vertical" gap="24px" padding="24px">
      <Text weight="bold" size="medium">
        {isEdit ? 'Edit Rule' : 'Add New Rule'}
      </Text>

      {error && (
        <Box backgroundColor="R10" borderRadius="8px" padding="12px">
          <Text skin="error">{error}</Text>
        </Box>
      )}

      <FormField label="Rule Name" required status={errors.name ? 'error' : undefined} statusMessage={errors.name}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Digital product surcharge"
          size="large"
        />
      </FormField>

      <FormField label="Product Category" required>
        <Dropdown
          options={CATEGORY_OPTIONS}
          selectedId={category}
          onSelect={(opt) => setCategory(opt.id as FeeRule['category'])}
          size="large"
        />
      </FormField>

      <FormField label="Fee Type" required>
        <Dropdown
          options={FEE_TYPE_OPTIONS}
          selectedId={feeType}
          onSelect={(opt) => setFeeType(opt.id as FeeRule['fee_type'])}
          size="large"
        />
      </FormField>

      <FormField
        label={feeType === 'percentage' ? 'Percentage (%)' : 'Fixed Amount ($)'}
        required
        status={errors.feeValue ? 'error' : undefined}
        statusMessage={errors.feeValue}
      >
        <Input
          type="number"
          value={feeValue}
          onChange={(e) => setFeeValue(e.target.value)}
          placeholder={feeType === 'percentage' ? 'e.g. 5' : 'e.g. 2.50'}
          suffix={<Text secondary>{feeType === 'percentage' ? '%' : '$'}</Text>}
          size="large"
        />
      </FormField>

      <FormField label="Active">
        <Toggle
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
      </FormField>

      <Box direction="horizontal" gap="12px" align="right">
        <Button priority="secondary" size="large" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button size="large" onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader size="tiny" /> : isEdit ? 'Save Changes' : 'Create Rule'}
        </Button>
      </Box>
    </Box>
  );
}