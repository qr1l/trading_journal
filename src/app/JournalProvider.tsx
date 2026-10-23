import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storage } from '../storage';
import { JournalContext, type JournalValue } from './journalContext';
import type { Settings, System, SystemInput } from '../types';

export function JournalProvider({ children }: { children: ReactNode }) {
  const [systems, setSystems] = useState<System[]>([]);
  const [settings, setSettings] = useState<Settings>({ dailyTradeLimit: null });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [loadedSystems, loadedSettings] = await Promise.all([
        storage.getSystems(),
        storage.getSettings(),
      ]);
      setSystems(loadedSystems);
      setSettings(loadedSettings);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createSystem = useCallback(
    async (input: SystemInput) => {
      const created = await storage.createSystem(input);
      await reload();
      return created;
    },
    [reload],
  );

  const updateSystem = useCallback(
    async (id: string, input: SystemInput) => {
      const updated = await storage.updateSystem(id, input);
      await reload();
      return updated;
    },
    [reload],
  );

  const deleteSystem = useCallback(
    async (id: string) => {
      await storage.deleteSystem(id);
      await reload();
    },
    [reload],
  );

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      await storage.updateSettings(patch);
      await reload();
    },
    [reload],
  );

  const value = useMemo<JournalValue>(
    () => ({
      systems,
      settings,
      loading,
      loadError,
      reload,
      createSystem,
      updateSystem,
      deleteSystem,
      updateSettings,
    }),
    [
      systems,
      settings,
      loading,
      loadError,
      reload,
      createSystem,
      updateSystem,
      deleteSystem,
      updateSettings,
    ],
  );

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}
