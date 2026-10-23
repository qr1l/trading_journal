import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from '../../app/router';
import { useJournal } from '../../app/journal';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { TextAreaField, TextField } from '../../components/ui/TextField';
import { PlusIcon, TrashIcon } from '../../components/icons';
import { validateSystemInput } from '../../domain/system';
import { createId } from '../../lib/id';
import { pluralize } from '../../lib/plural';
import type { System } from '../../types';
import styles from './SystemFormScreen.module.css';

interface SystemFormScreenProps {
  systemId?: string;
}

export function SystemFormScreen({ systemId }: SystemFormScreenProps) {
  const { systems, loading } = useJournal();
  const { back } = useRouter();

  const title = systemId ? 'Редактирование системы' : 'Новая система';
  const system = systemId ? systems.find((item) => item.id === systemId) : undefined;

  if (loading) {
    return (
      <>
        <ScreenHeader title={title} onBack={back} />
        <p className={styles.status}>Загрузка…</p>
      </>
    );
  }

  if (systemId && !system) {
    return (
      <>
        <ScreenHeader title={title} onBack={back} />
        <EmptyState
          title="Система не найдена"
          description="Возможно, её удалили. Вернитесь к списку систем."
          action={
            <Button variant="secondary" onClick={back}>
              К списку систем
            </Button>
          }
        />
      </>
    );
  }

  return <SystemForm key={systemId ?? 'new'} system={system} />;
}

interface ChecklistDraft {
  id: string;
  text: string;
}

function SystemForm({ system }: { system?: System }) {
  const { createSystem, updateSystem } = useJournal();
  const { back, navigate } = useRouter();

  const [name, setName] = useState(system?.name ?? '');
  const [description, setDescription] = useState(system?.description ?? '');
  const [checklist, setChecklist] = useState<ChecklistDraft[]>(
    system?.checklist.map((item) => ({ id: item.id, text: item.text })) ?? [],
  );
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const nameError = submitted && name.trim().length === 0 ? 'Введите название системы' : null;
  const checklistError =
    submitted && checklist.some((item) => item.text.trim().length === 0)
      ? 'Заполните текст пункта или удалите его'
      : null;

  function addItem(afterIndex?: number) {
    const item: ChecklistDraft = { id: createId(), text: '' };
    setChecklist((current) => {
      if (afterIndex === undefined) {
        return [...current, item];
      }
      return [...current.slice(0, afterIndex + 1), item, ...current.slice(afterIndex + 1)];
    });
  }

  function updateItem(id: string, text: string) {
    setChecklist((current) => current.map((item) => (item.id === id ? { ...item, text } : item)));
  }

  function removeItem(id: string) {
    setChecklist((current) => current.filter((item) => item.id !== id));
  }

  function handleItemKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addItem(index);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setSaveError(null);

    const input = { name, description, checklist };
    const problem = validateSystemInput(input);
    if (problem) {
      return;
    }

    setSaving(true);
    try {
      if (system) {
        await updateSystem(system.id, input);
      } else {
        await createSystem(input);
      }
      navigate({ name: 'systems' });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Не удалось сохранить систему');
    } finally {
      setSaving(false);
    }
  }

  const title = system ? 'Редактирование системы' : 'Новая система';

  return (
    <>
      <ScreenHeader title={title} onBack={back} />

      <form className={styles.form} onSubmit={(event) => void handleSubmit(event)} noValidate>
        {saveError ? (
          <p className={styles.errorBanner} role="alert">
            {saveError}
          </p>
        ) : null}

        <TextField
          label="Название"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Например: Пробой уровня"
          maxLength={80}
          error={nameError}
        />

        <TextAreaField
          label="Описание"
          hint="Необязательно — коротко о том, что это за система"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Когда применять, на каком таймфрейме"
          maxLength={500}
          rows={3}
        />

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Чек-лист входа</h2>
            <span className={styles.counter}>
              {checklist.length}{' '}
              {pluralize(checklist.length, ['пункт', 'пункта', 'пунктов'])}
            </span>
          </div>
          <p className={styles.sectionHint}>
            Условия, которые вы проверяете перед входом в сделку. Порядок не важен.
          </p>

          {checklist.length > 0 ? (
            <ul className={styles.checklist}>
              {checklist.map((item, index) => (
                <li key={item.id} className={styles.checklistRow}>
                  <input
                    className={styles.input}
                    value={item.text}
                    onChange={(event) => updateItem(item.id, event.target.value)}
                    onKeyDown={(event) => handleItemKeyDown(event, index)}
                    placeholder={`Пункт ${index + 1}`}
                    aria-label={`Пункт чек-листа ${index + 1}`}
                    maxLength={200}
                  />
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeItem(item.id)}
                    aria-label={`Удалить пункт ${index + 1}`}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.checklistEmpty}>
              Пунктов пока нет. Без чек-листа сделка не будет проверяться по правилам.
            </p>
          )}

          {checklistError ? (
            <p className={styles.fieldError} role="alert">
              {checklistError}
            </p>
          ) : null}

          <Button
            variant="secondary"
            size="sm"
            icon={<PlusIcon />}
            onClick={() => addItem()}
            className={styles.addButton}
          >
            Добавить пункт
          </Button>
        </section>

        <div className={styles.footer}>
          <Button type="submit" fullWidth disabled={saving}>
            {saving ? 'Сохраняем…' : system ? 'Сохранить изменения' : 'Создать систему'}
          </Button>
        </div>
      </form>
    </>
  );
}
