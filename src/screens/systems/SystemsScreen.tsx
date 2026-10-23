import { useState } from 'react';
import { useRouter } from '../../app/router';
import { useJournal } from '../../app/journal';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { PencilIcon, PlusIcon, SystemsIcon, TrashIcon } from '../../components/icons';
import { pluralize } from '../../lib/plural';
import styles from './SystemsScreen.module.css';

export function SystemsScreen() {
  const { systems, loading, loadError, deleteSystem } = useJournal();
  const { navigate, back, canGoBack } = useRouter();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);

    try {
      await deleteSystem(id);
      setConfirmingId(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Не удалось удалить систему',
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <ScreenHeader
        title="Системы"
        subtitle={
          systems.length > 0
            ? `${systems.length} ${pluralize(systems.length, ['система', 'системы', 'систем'])}`
            : undefined
        }
        onBack={canGoBack ? back : undefined}
        action={
          systems.length > 0 ? (
            <Button
              size="sm"
              variant="secondary"
              icon={<PlusIcon />}
              onClick={() => navigate({ name: 'system-form' })}
            >
              Новая
            </Button>
          ) : undefined
        }
      />

      <div className={styles.body}>
        {loadError ? (
          <p className={styles.error} role="alert">
            {loadError}
          </p>
        ) : null}

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        {loading ? <p className={styles.status}>Загрузка…</p> : null}

        {!loading && systems.length === 0 ? (
          <EmptyState
            icon={<SystemsIcon />}
            title="Пока нет ни одной системы"
            description="Опишите свою торговую систему: название и чек-лист условий входа. Потом отмечайте его в каждой сделке."
            action={
              <Button
                icon={<PlusIcon />}
                onClick={() => navigate({ name: 'system-form' })}
              >
                Создать систему
              </Button>
            }
          />
        ) : null}

        {systems.length > 0 ? (
          <ul className={styles.list}>
            {systems.map((system) => {
              const isConfirming = confirmingId === system.id;
              const isDeleting = deletingId === system.id;

              return (
                <li key={system.id} className={styles.card}>
                  <button
                    type="button"
                    className={styles.cardMain}
                    onClick={() => navigate({ name: 'system-form', systemId: system.id })}
                  >
                    <span className={styles.name}>{system.name}</span>
                    {system.description ? (
                      <span className={styles.description}>{system.description}</span>
                    ) : null}
                    <span className={styles.meta}>
                      Чек-лист: {system.checklist.length}{' '}
                      {pluralize(system.checklist.length, ['пункт', 'пункта', 'пунктов'])}
                    </span>
                  </button>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      aria-label={`Редактировать систему «${system.name}»`}
                      onClick={() => navigate({ name: 'system-form', systemId: system.id })}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      aria-label={`Удалить систему «${system.name}»`}
                      onClick={() => setConfirmingId(isConfirming ? null : system.id)}
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  {isConfirming ? (
                    <div className={styles.confirm}>
                      <p className={styles.confirmText}>
                        Удалить систему «{system.name}»? Записанные сделки останутся.
                      </p>
                      <div className={styles.confirmActions}>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => void handleDelete(system.id)}
                        >
                          {isDeleting ? 'Удаляем…' : 'Удалить'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => setConfirmingId(null)}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </>
  );
}
