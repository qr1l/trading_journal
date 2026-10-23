import type { ReactNode } from 'react';
import { ChevronLeftIcon } from '../icons';
import styles from './ScreenHeader.module.css';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
}

export function ScreenHeader({ title, subtitle, onBack, action }: ScreenHeaderProps) {
  return (
    <header className={styles.header}>
      {onBack ? (
        <button type="button" className={styles.back} onClick={onBack} aria-label="Назад">
          <ChevronLeftIcon />
        </button>
      ) : (
        <span className={styles.backPlaceholder} aria-hidden="true" />
      )}

      <div className={styles.titles}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>

      <div className={styles.action}>{action}</div>
    </header>
  );
}
