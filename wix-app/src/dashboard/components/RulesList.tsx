import React from 'react';
import {
  Table,
  TableToolbar,
  Button,
  Badge,
  IconButton,
  Box,
  Text,
  EmptyState,
} from '@wix/design-system';
import { Edit, Delete } from '@wix/wix-ui-icons-common';
import { FeeRule, deleteRule } from './api';

interface RulesListProps {
  rules: FeeRule[];
  onEdit: (rule: FeeRule) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

function formatFeeValue(rule: FeeRule): string {
  return rule.fee_type === 'percentage'
    ? `${rule.fee_value}%`
    : `$${rule.fee_value.toFixed(2)}`;
}

export function RulesList({ rules, onEdit, onDelete, onAdd }: RulesListProps) {
  const columns = [
    {
      title: 'Rule Name',
      render: (rule: FeeRule) => <Text weight="normal">{rule.name}</Text>,
    },
    {
      title: 'Category',
      render: (rule: FeeRule) => (
        <Badge skin="neutralLight" size="small" uppercase={false}>
          {rule.category}
        </Badge>
      ),
    },
    {
      title: 'Fee',
      render: (rule: FeeRule) => (
        <Text weight="bold">{formatFeeValue(rule)}</Text>
      ),
    },
    {
      title: 'Type',
      render: (rule: FeeRule) => (
        <Text secondary size="small">
          {rule.fee_type === 'percentage' ? 'Percentage' : 'Fixed'}
        </Text>
      ),
    },
    {
      title: 'Status',
      render: (rule: FeeRule) => (
        <Badge skin={rule.is_active ? 'success' : 'neutral'} size="small" uppercase={false}>
          {rule.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      title: 'Actions',
      render: (rule: FeeRule) => (
        <Box direction="horizontal" gap="8px">
          <IconButton
            size="small"
            priority="secondary"
            onClick={() => onEdit(rule)}
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            priority="secondary"
            skin="destructive"
            onClick={() => onDelete(rule.id)}
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (rules.length === 0) {
    return (
      <EmptyState
        title="No fee rules yet"
        subtitle="Add your first rule to start applying fees to products."
        theme="section"
      >
        <Button onClick={onAdd}>Add Rule</Button>
      </EmptyState>
    );
  }

  return (
    <Table data={rules} columns={columns} rowVerticalPadding="medium">
      <TableToolbar>
        <TableToolbar.Title>Fee Rules ({rules.length})</TableToolbar.Title>
        <TableToolbar.Buttons>
          <Button size="small" onClick={onAdd}>
            + Add Rule
          </Button>
        </TableToolbar.Buttons>
      </TableToolbar>
      <Table.Content />
    </Table>
  );
}