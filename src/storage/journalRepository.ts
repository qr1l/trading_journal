import { createId } from '../lib/id';
import { normalizeSystemInput, toChecklistItems, validateSystemInput } from '../domain/system';
import type { ChecklistItem, Settings, System, SystemInput } from '../types';
import { StorageError, type JournalData, type JournalRepository, type StorageLike } from './types';

export const STORAGE_KEY = 'trading-journal:data';
export const SCHEMA_VERSION = 1;

export function createEmptyData(): JournalData {
  return {
    version: SCHEMA_VERSION,
    systems: [],
    trades: [],
    settings: { dailyTradeLimit: null },
  };
}

export function createJournalRepository(storage: StorageLike): JournalRepository {
  async function load(): Promise<JournalData> {
    return readData(storage);
  }

  async function save(data: JournalData): Promise<void> {
    writeData(storage, data);
  }

  return {
    async getSystems() {
      const data = await load();
      return sortSystems(data.systems);
    },

    async getSystem(id) {
      const data = await load();
      return data.systems.find((system) => system.id === id) ?? null;
    },

    async createSystem(input) {
      assertValidInput(input);

      const now = new Date().toISOString();
      const system: System = {
        id: createId(),
        name: input.name.trim(),
        description: input.description.trim(),
        checklist: toChecklistItems(input),
        createdAt: now,
        updatedAt: now,
      };

      const data = await load();
      await save({ ...data, systems: [system, ...data.systems] });
      return system;
    },

    async updateSystem(id, input) {
      assertValidInput(input);

      const data = await load();
      const existing = data.systems.find((system) => system.id === id);
      if (!existing) {
        throw new StorageError('Система не найдена — возможно, она уже удалена');
      }

      const updated: System = {
        ...existing,
        name: input.name.trim(),
        description: input.description.trim(),
        checklist: toChecklistItems(input),
        updatedAt: new Date().toISOString(),
      };

      await save({
        ...data,
        systems: data.systems.map((system) => (system.id === id ? updated : system)),
      });
      return updated;
    },

    async deleteSystem(id) {
      const data = await load();
      const systems = data.systems.filter((system) => system.id !== id);
      if (systems.length === data.systems.length) {
        return;
      }
      await save({ ...data, systems });
    },

    async getSettings() {
      const data = await load();
      return data.settings;
    },

    async updateSettings(patch) {
      if ('dailyTradeLimit' in patch) {
        assertDailyTradeLimit(patch.dailyTradeLimit ?? null);
      }

      const data = await load();
      const settings: Settings = { ...data.settings, ...patch };
      await save({ ...data, settings });
      return settings;
    },
  };
}

function readData(storage: StorageLike): JournalData {
  let raw: string | null = null;

  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return createEmptyData();
  }

  if (!raw) {
    return createEmptyData();
  }

  try {
    return parseData(JSON.parse(raw));
  } catch {
    return createEmptyData();
  }
}

function writeData(storage: StorageLike, data: JournalData): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    throw new StorageError(
      'Не удалось сохранить данные: хранилище браузера недоступно или переполнено',
    );
  }
}

function parseData(value: unknown): JournalData {
  if (!isRecord(value)) {
    return createEmptyData();
  }

  const systems = Array.isArray(value.systems)
    ? value.systems.filter(isSystem).map(normalizeSystem)
    : [];

  const trades = Array.isArray(value.trades) ? value.trades : [];

  return {
    version: typeof value.version === 'number' ? value.version : SCHEMA_VERSION,
    systems,
    trades,
    settings: {
      dailyTradeLimit: parseDailyTradeLimit(value.settings),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSystem(value: unknown): value is System {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    Array.isArray(value.checklist) &&
    value.checklist.every(isChecklistItem)
  );
}

function isChecklistItem(value: unknown): value is ChecklistItem {
  return isRecord(value) && typeof value.id === 'string' && typeof value.text === 'string';
}

function normalizeSystem(system: System): System {
  return {
    ...system,
    checklist: system.checklist.map((item) => ({ id: item.id, text: item.text })),
  };
}

function parseDailyTradeLimit(settings: unknown): number | null {
  if (!isRecord(settings)) {
    return null;
  }

  const value = settings.dailyTradeLimit;
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}

function sortSystems(systems: System[]): System[] {
  return [...systems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function assertValidInput(input: SystemInput): void {
  // Пустые пункты чек-листа не ошибка для хранилища: они отбрасываются при нормализации.
  // Форма дополнительно проверяет их через validateSystemInput до вызова хранилища.
  const problem = validateSystemInput(normalizeSystemInput(input));
  if (problem) {
    throw new StorageError(problem);
  }
}

function assertDailyTradeLimit(value: number | null): void {
  if (value === null) {
    return;
  }

  if (!Number.isInteger(value) || value <= 0) {
    throw new StorageError('Дневной лимит сделок должен быть целым числом больше нуля');
  }
}
