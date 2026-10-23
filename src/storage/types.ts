import type { Settings, System, SystemInput } from '../types';

/** Полное содержимое журнала — то, что целиком лежит в хранилище. */
export interface JournalData {
  version: number;
  systems: System[];
  trades: unknown[];
  settings: Settings;
}

/**
 * Публичный интерфейс хранилища. Все методы асинхронные намеренно:
 * так localStorage можно будет заменить на Supabase, не переписывая экраны.
 */
export interface JournalRepository {
  getSystems(): Promise<System[]>;
  getSystem(id: string): Promise<System | null>;
  createSystem(input: SystemInput): Promise<System>;
  updateSystem(id: string, input: SystemInput): Promise<System>;
  deleteSystem(id: string): Promise<void>;
  getSettings(): Promise<Settings>;
  updateSettings(patch: Partial<Settings>): Promise<Settings>;
}

/** Минимальный контракт браузерного localStorage — чтобы подменять его в тестах. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}
