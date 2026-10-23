import type { StorageLike } from './types';

/** Хранилище в памяти: запасной вариант, если localStorage недоступен. */
export function createMemoryStorage(): StorageLike {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}
