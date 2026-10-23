import { createContext } from 'react';
import type { Settings, System, SystemInput } from '../types';

export interface JournalValue {
  systems: System[];
  settings: Settings;
  loading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;
  createSystem: (input: SystemInput) => Promise<System>;
  updateSystem: (id: string, input: SystemInput) => Promise<System>;
  deleteSystem: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
}

export const JournalContext = createContext<JournalValue | null>(null);
