import { useState, useEffect, useCallback } from 'react';
import { Intake, IntakeUpdate } from '@/types/database';

export function useIntake(intakeId?: string) {
  const [intake, setIntake] = useState<Intake | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load intake by ID
  const loadIntake = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/intakes/${id}`);
      if (!response.ok) throw new Error('Failed to load intake');
      const { intake } = await response.json();
      setIntake(intake);
      return intake;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new intake
  const createIntake = useCallback(async (data: Partial<Intake>) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/intakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create intake');
      const { intake } = await response.json();
      setIntake(intake);
      setLastSaved(new Date());
      return intake;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  // Update existing intake
  const updateIntake = useCallback(async (id: string, updates: IntakeUpdate) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/intakes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update intake');
      const { intake: updatedIntake } = await response.json();
      setIntake(updatedIntake);
      setLastSaved(new Date());
      return updatedIntake;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  // Auto-save functionality
  const autoSave = useCallback(async (id: string | null, data: Partial<Intake>) => {
    if (id) {
      // Update existing
      return updateIntake(id, data);
    } else {
      // Create new
      return createIntake(data);
    }
  }, [createIntake, updateIntake]);

  // Delete intake
  const deleteIntake = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/intakes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete intake');
      setIntake(null);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load intake on mount if ID provided
  useEffect(() => {
    if (intakeId) {
      loadIntake(intakeId);
    }
  }, [intakeId, loadIntake]);

  return {
    intake,
    loading,
    saving,
    error,
    lastSaved,
    loadIntake,
    createIntake,
    updateIntake,
    deleteIntake,
    autoSave,
  };
}

