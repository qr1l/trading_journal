import { createMemoryStorage } from './memoryStorage';
import { createJournalRepository } from './journalRepository';
import type { StorageLike } from './types';

/** true — данные сохраняются в localStorage и переживают перезагрузку страницы. */
export const isPersistenceAvailable = detectBrowserStorage() !== null;

/**
 * Единственная точка доступа к данным приложения.
 * Экраны и компоненты не должны трогать localStorage напрямую.
 */
export const storage = createJournalRepository(detectBrowserStorage() ?? createMemoryStorage());

export { StorageError } from './types';
export type { JournalRepository, StorageLike } from './types';

function detectBrowserStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const probeKey = '__trading_journal_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    return null;
  }
}
