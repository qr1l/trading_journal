import { beforeEach, describe, expect, it } from 'vitest';
import {
  createEmptyData,
  createJournalRepository,
  SCHEMA_VERSION,
  STORAGE_KEY,
} from './journalRepository';
import { createMemoryStorage } from './memoryStorage';
import { StorageError, type StorageLike } from './types';

const VALID_INPUT = {
  name: '  Пробой уровня  ',
  description: '  Вход на ретесте  ',
  checklist: [
    { text: '  Тренд на старшем ТФ  ' },
    { text: '  Уровень подтверждён  ' },
    { text: '   ' },
  ],
};

describe('journalRepository', () => {
  let storage: StorageLike;

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it('возвращает пустые данные и настройки по умолчанию', async () => {
    const repo = createJournalRepository(storage);

    expect(await repo.getSystems()).toEqual([]);
    expect(await repo.getSettings()).toEqual({ dailyTradeLimit: null });
  });

  it('создаёт систему, обрезает пробелы и выбрасывает пустые пункты', async () => {
    const repo = createJournalRepository(storage);

    const system = await repo.createSystem(VALID_INPUT);

    expect(system.name).toBe('Пробой уровня');
    expect(system.description).toBe('Вход на ретесте');
    expect(system.checklist).toHaveLength(2);
    expect(system.checklist[0]?.text).toBe('Тренд на старшем ТФ');
    expect(system.checklist.every((item) => item.id.length > 0)).toBe(true);
    expect(system.id.length).toBeGreaterThan(0);
  });

  it('сохраняет данные между экземплярами репозитория', async () => {
    const first = createJournalRepository(storage);
    const created = await first.createSystem(VALID_INPUT);

    const second = createJournalRepository(storage);
    const systems = await second.getSystems();

    expect(systems).toHaveLength(1);
    expect(systems[0]?.id).toBe(created.id);
    expect(systems[0]?.checklist).toHaveLength(2);
  });

  it('обновляет систему, сохраняя id пунктов и дату создания', async () => {
    const repo = createJournalRepository(storage);
    const created = await repo.createSystem(VALID_INPUT);

    const updated = await repo.updateSystem(created.id, {
      name: 'Новое имя',
      description: '',
      checklist: [
        { id: created.checklist[0]?.id, text: 'Тренд на старшем ТФ' },
        { text: 'Новый пункт' },
      ],
    });

    expect(updated.name).toBe('Новое имя');
    expect(updated.createdAt).toBe(created.createdAt);
    expect(updated.checklist).toHaveLength(2);
    expect(updated.checklist[0]?.id).toBe(created.checklist[0]?.id);
    expect(updated.updatedAt >= created.updatedAt).toBe(true);
  });

  it('удаляет систему', async () => {
    const repo = createJournalRepository(storage);
    const created = await repo.createSystem(VALID_INPUT);

    await repo.deleteSystem(created.id);

    expect(await repo.getSystems()).toEqual([]);
    expect(await repo.getSystem(created.id)).toBeNull();
  });

  it('не падает при удалении несуществующей системы', async () => {
    const repo = createJournalRepository(storage);
    await expect(repo.deleteSystem('missing')).resolves.toBeUndefined();
  });

  it('отклоняет систему без названия', async () => {
    const repo = createJournalRepository(storage);

    await expect(repo.createSystem({ ...VALID_INPUT, name: '   ' })).rejects.toBeInstanceOf(
      StorageError,
    );
    expect(await repo.getSystems()).toEqual([]);
  });

  it('отбрасывает пустые пункты чек-листа, а не падает', async () => {
    const repo = createJournalRepository(storage);

    const system = await repo.createSystem({
      name: 'Система',
      description: '',
      checklist: [{ text: '  ' }, { text: 'Реальный пункт' }],
    });

    expect(system.checklist).toHaveLength(1);
    expect(system.checklist[0]?.text).toBe('Реальный пункт');
  });

  it('возвращает пустые данные, если в хранилище лежит мусор', async () => {
    storage.setItem(STORAGE_KEY, '{не json');
    const repo = createJournalRepository(storage);

    expect(await repo.getSystems()).toEqual([]);
    expect(await repo.getSettings()).toEqual({ dailyTradeLimit: null });
  });

  it('отбрасывает повреждённые системы, но читает целые', async () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: SCHEMA_VERSION,
        systems: [
          {
            id: 'ok',
            name: 'Целая',
            description: '',
            checklist: [],
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          { id: 'broken', name: 42 },
        ],
        trades: [],
        settings: { dailyTradeLimit: 3 },
      }),
    );

    const repo = createJournalRepository(storage);
    const systems = await repo.getSystems();

    expect(systems.map((system) => system.id)).toEqual(['ok']);
    expect(await repo.getSettings()).toEqual({ dailyTradeLimit: 3 });
  });

  it('сортирует системы: недавно изменённые сверху', async () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...createEmptyData(),
        systems: [
          {
            id: 'old',
            name: 'Старая',
            description: '',
            checklist: [],
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
          {
            id: 'new',
            name: 'Новая',
            description: '',
            checklist: [],
            createdAt: '2026-02-01T00:00:00.000Z',
            updatedAt: '2026-03-01T00:00:00.000Z',
          },
        ],
      }),
    );

    const repo = createJournalRepository(storage);
    const systems = await repo.getSystems();

    expect(systems.map((system) => system.id)).toEqual(['new', 'old']);
  });

  it('сохраняет и валидирует дневной лимит сделок', async () => {
    const repo = createJournalRepository(storage);

    expect(await repo.updateSettings({ dailyTradeLimit: 3 })).toEqual({ dailyTradeLimit: 3 });
    expect(await repo.getSettings()).toEqual({ dailyTradeLimit: 3 });
    expect(await repo.updateSettings({ dailyTradeLimit: null })).toEqual({ dailyTradeLimit: null });

    await expect(repo.updateSettings({ dailyTradeLimit: 0 })).rejects.toBeInstanceOf(StorageError);
    await expect(repo.updateSettings({ dailyTradeLimit: 1.5 })).rejects.toBeInstanceOf(
      StorageError,
    );
  });
});
