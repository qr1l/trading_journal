import { createId } from '../lib/id';
import type { ChecklistItem, SystemInput } from '../types';

/** Обрезает пробелы и выбрасывает пустые пункты чек-листа. */
export function normalizeSystemInput(input: SystemInput): SystemInput {
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    checklist: input.checklist
      .map((item) => ({ id: item.id, text: item.text.trim() }))
      .filter((item) => item.text.length > 0),
  };
}

/** Возвращает текст ошибки для формы или null, если ввод корректен. */
export function validateSystemInput(input: SystemInput): string | null {
  const normalized = normalizeSystemInput(input);

  if (normalized.name.length === 0) {
    return 'Введите название системы';
  }

  if (normalized.name.length > 80) {
    return 'Название системы — не длиннее 80 символов';
  }

  if (normalized.description.length > 500) {
    return 'Описание — не длиннее 500 символов';
  }

  if (input.checklist.some((item) => item.text.trim().length === 0)) {
    return 'Заполните текст пункта чек-листа или удалите его';
  }

  if (normalized.checklist.some((item) => item.text.length > 200)) {
    return 'Пункт чек-листа — не длиннее 200 символов';
  }

  return null;
}

/** Приводит пункты чек-листа к виду хранилища: гарантирует id у каждого пункта. */
export function toChecklistItems(input: SystemInput): ChecklistItem[] {
  return normalizeSystemInput(input).checklist.map((item) => ({
    id: item.id ?? createId(),
    text: item.text,
  }));
}
