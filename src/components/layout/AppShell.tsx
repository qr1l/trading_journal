import type { ReactNode } from 'react';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
  withNav: boolean;
}

export function AppShell({ children, withNav }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <main
        className={[styles.content, withNav ? styles.withNav : ''].filter(Boolean).join(' ')}
      >
        {children}
      </main>
    </div>
  );
}
