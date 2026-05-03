import React, { useEffect, useState, useCallback } from 'react';
import {
  Page,
  WixDesignSystemProvider,
  Box,
  Loader,
  Text,
  Modal,
  CustomModalLayout,
  ConfirmationModalLayout,
} from '@wix/design-system';
import { dashboard } from '@wix/dashboard';
import { getRules, deleteRule, FeeRule } from '../components/api';
import { RulesList } from '../components/RulesList';
import { RuleForm } from '../components/RuleForm';

type ModalState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit'; rule: FeeRule }
  | { type: 'confirmDelete'; ruleId: string };

export default function FeeCalculatorPage() {
  const [rules, setRules] = useState<FeeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });

  const loadRules = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getRules();
      setRules(data);
    } catch (err: any) {
      setFetchError(err.message ?? 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  function handleSaved(saved: FeeRule) {
    setModal({ type: 'none' });
    // Optimistic update: replace or prepend the saved rule
    setRules((prev) => {
      const idx = prev.findIndex((r) => r.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });

    dashboard.showToast({
      message: 'Rule saved successfully',
      type: 'success',
    });
  }

  async function handleDelete(id: string) {
    setModal({ type: 'none' });
    try {
      await deleteRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
      dashboard.showToast({ message: 'Rule deleted', type: 'success' });
    } catch (err: any) {
      dashboard.showToast({ message: err.message ?? 'Delete failed', type: 'error' });
    }
  }

  return (
    <WixDesignSystemProvider>
      <Page>
        <Page.Header
          title="Fee Calculator"
          subtitle="Configure pricing rules applied to your store's products"
        />

        <Page.Content>
          <Box direction="vertical" gap="24px">
            {loading && (
              <Box align="center" padding="48px">
                <Loader size="medium" />
              </Box>
            )}

            {!loading && fetchError && (
              <Box padding="24px">
                <Text skin="error">{fetchError}</Text>
              </Box>
            )}

            {!loading && !fetchError && (
              <RulesList
                rules={rules}
                onEdit={(rule) => setModal({ type: 'edit', rule })}
                onDelete={(id) => setModal({ type: 'confirmDelete', ruleId: id })}
                onAdd={() => setModal({ type: 'add' })}
              />
            )}
          </Box>
        </Page.Content>
      </Page>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modal.type === 'add' || modal.type === 'edit'}
        onRequestClose={() => setModal({ type: 'none' })}
        screen="desktop"
      >
        <CustomModalLayout
          width="600px"
          onCloseButtonClick={() => setModal({ type: 'none' })}
        >
          <RuleForm
            rule={modal.type === 'edit' ? modal.rule : null}
            onSaved={handleSaved}
            onCancel={() => setModal({ type: 'none' })}
          />
        </CustomModalLayout>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modal.type === 'confirmDelete'}
        onRequestClose={() => setModal({ type: 'none' })}
        screen="desktop"
      >
        <ConfirmationModalLayout
          title="Delete this rule?"
          content="This action cannot be undone. The fee rule will be removed permanently."
          primaryButtonText="Delete"
          primaryButtonOnClick={() =>
            modal.type === 'confirmDelete' && handleDelete(modal.ruleId)
          }
          secondaryButtonText="Cancel"
          secondaryButtonOnClick={() => setModal({ type: 'none' })}
          theme="destructive"
        />
      </Modal>
    </WixDesignSystemProvider>
  );
}